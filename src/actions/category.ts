"use server";

import { Category, Prisma } from "@/generated/prisma";
import ActionErrorHandler from "@/lib/action-error-handler";
import { getErrorMessage } from "@/lib/handle-error";
import prisma from "@/lib/prisma";
import { GetCategorySchema } from "@/lib/search-params/search-category";
import { TActionResult } from "@/types/action.type";
import { createCategorySchema } from "@/validation/category.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { after, connection } from "next/server";

export async function getCategorysWithFilters(input: GetCategorySchema) {
  await connection();

  try {
    const { page, perPage, sort, name, createdAt } = input;

    const skip = (page - 1) * perPage;

    const orderBy = sort.length
      ? sort.map(({ id, desc }) => ({ [id]: desc ? "desc" : "asc" }))
      : [{ createdAt: "desc" }];

    // filter
    const where: Prisma.CategoryWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (createdAt.length === 2) {
      where.createdAt = {
        gte: new Date(createdAt[0]),
        lte: new Date(createdAt[1]),
      };
    }

    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      status: true,
      message: "Categorys fetched successfully",
      data: { data, total, page, perPage },
    };
  } catch (err) {
    return {
      status: false,
      message: getErrorMessage(err) || "Failed to fetch Categorys",
      data: { data: [], total: 0, page: 0, perPage: 0 },
    };
  }
}

export async function getCategorys() {
  await connection();

  try {
    const categorys = await prisma.category.findMany();

    return {
      status: true,
      message: "Categorys fetched successfully",
      data: categorys,
    };
  } catch (err) {
    return {
      status: false,
      message: getErrorMessage(err) || "Failed to fetch Categorys",
      data: [],
    };
  }
}

export async function createCategoryAction(
  formData: unknown,
): Promise<TActionResult<Category>> {
  try {
    // 🔍 Validasi dengan Zod
    const parsed = createCategorySchema.safeParse(formData);

    if (!parsed.success) {
      return ActionErrorHandler.handleZod(parsed.error);
    }

    const { name, description } = parsed.data;

    // 💾 Simpan ke database dengan Prisma
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    revalidatePath("/dashboard/category");
    return {
      status: true,
      message: "Produk berhasil dibuat",
      data: category,
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

export async function deleteCategorys({ ids }: { ids: string[] }) {
  try {
    const categorys = await prisma.category.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/dashboard/category");
    return {
      data: categorys,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}
