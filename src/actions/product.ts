"use server";

import { Prisma } from "@/generated/prisma";
import ActionErrorHandler from "@/lib/action-error-handler";
import { getErrorMessage } from "@/lib/handle-error";
import prisma from "@/lib/prisma";
import { GetProductSchema } from "@/lib/search-params/search-product";
import {
  createProductSchema,
  updateProductSchema,
} from "@/validation/product.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";

export async function getProducts(input: GetProductSchema) {
  await connection();

  try {
    const { page, perPage, sort, price, name, createdAt } = input;

    const skip = (page - 1) * perPage;

    const orderBy = sort.length
      ? sort.map(({ id, desc }) => ({ [id]: desc ? "desc" : "asc" }))
      : [{ createdAt: "desc" }];

    // filter
    const where: Prisma.ProductWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (price !== null && price !== undefined) {
      where.price = price;
    }

    if (createdAt.length === 2) {
      where.createdAt = {
        gte: new Date(createdAt[0]),
        lte: new Date(createdAt[1]),
      };
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      status: true,
      message: "Products fetched successfully",
      data: { data, total, page, perPage },
    };
  } catch (err) {
    return {
      status: false,
      message: getErrorMessage(err) || "Failed to fetch products",
    };
  }
}

export async function createProductAction(formData: unknown) {
  try {
    // 🔍 Validasi dengan Zod
    const parsed = createProductSchema.safeParse(formData);

    if (!parsed.success) {
      return ActionErrorHandler.handleZod(parsed.error);
    }

    const { name, price, description } = parsed.data;

    // 💾 Simpan ke database dengan Prisma
    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
      },
    });

    return {
      status: true,
      message: "Produk berhasil dibuat",
      data: product,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // Prisma error
      return ActionErrorHandler.handlePrisma(error);
    }

    // Default handler
    return ActionErrorHandler.handleDefault(error);
  }
}

export async function updateProductAction(id: string, formData: unknown) {
  try {
    const parsed = updateProductSchema.partial().safeParse(formData);
    // pakai partial biar bisa update sebagian field

    if (!parsed.success) {
      return ActionErrorHandler.handleZod(parsed.error);
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    return {
      status: true,
      message: "Produk berhasil diperbarui",
      data: product,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return ActionErrorHandler.handlePrisma(error);
    }
    return ActionErrorHandler.handleDefault(error);
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });

    return {
      status: true,
      message: "Produk berhasil dihapus",
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return ActionErrorHandler.handlePrisma(error);
    }
    return ActionErrorHandler.handleDefault(error);
  }
}

export async function deleteProducts({ ids }: { ids: string[] }) {
  try {
    const products = await prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/dashboard/product");
    return {
      data: products,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}
