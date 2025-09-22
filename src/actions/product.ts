"use server";

import { Prisma, Product } from "@/generated/prisma";
import ActionErrorHandler from "@/lib/action-error-handler";
import { getErrorMessage } from "@/lib/handle-error";
import prisma from "@/lib/prisma";
import { GetProductSchema } from "@/lib/search-params/search-product";
import { TActionResult } from "@/types/action.type";
import {
  createProductSchema,
  updateProductSchema,
} from "@/validation/product.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { after, connection } from "next/server";

export async function getProductsWithFilters(input: GetProductSchema) {
  await connection();

  try {
    const { page, perPage, sort, price, name, createdAt } = input;
    const skip = (page - 1) * perPage;

    const orderBy = sort.length
      ? sort.map(({ id, desc }) => ({ [id]: desc ? "desc" : "asc" }))
      : [{ createdAt: "desc" }];

    // filter
    const where: Prisma.ProductWhereInput = {
      ...(name && {
        name: {
          contains: name,
          mode: "insensitive",
        },
      }),

      ...(price !== null &&
        price !== undefined && {
          price,
        }),

      ...(createdAt.length === 2 && {
        createdAt: {
          gte: new Date(createdAt[0]),
          lte: new Date(createdAt[1]),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          category: true,
        },
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
      data: { data: [], total: 0, page: 0, perPage: 0 },
    };
  }
}

export async function getProducts() {
  await connection();

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    return {
      status: true,
      data: products,
      message: "Products fetched successfully",
    };
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error) || "Failed to fetch products",
      data: [],
    };
  }
}

export async function createProductAction(
  formData: unknown,
): Promise<TActionResult<Product>> {
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
    after(() => {
      if (error instanceof PrismaClientKnownRequestError) {
        // Prisma error
        console.error(ActionErrorHandler.handlePrisma(error));
      } else {
        // Default handler
        console.error(ActionErrorHandler.handleDefault(error));
      }
    });

    return {
      status: false,
      errors: null,
      message: getErrorMessage(error),
    };
  }
}

export async function updateProductAction(
  id: string,
  formData: unknown,
): Promise<TActionResult<Product>> {
  try {
    const parsed = updateProductSchema.partial().safeParse(formData);
    // pakai partial biar bisa update sebagian field

    if (!parsed.success) {
      return ActionErrorHandler.handleZod(parsed.error);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        category: {
          connect: {
            id: parsed.data.category,
          },
        },
      },
    });

    revalidatePath("/dashboard/product");

    return {
      status: true,
      message: "Produk berhasil diperbarui",
      data: product,
    };
  } catch (error) {
    after(() => {
      if (error instanceof PrismaClientKnownRequestError) {
        // Prisma error
        console.error(ActionErrorHandler.handlePrisma(error));
      } else {
        // Default handler
        console.error(ActionErrorHandler.handleDefault(error));
      }
    });

    return {
      status: false,
      errors: null,
      message: getErrorMessage(error),
    };
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

export async function getTotalProduct() {
  await connection();
  try {
    const result = await prisma.product.count();
    return result;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 0;
  }
}
