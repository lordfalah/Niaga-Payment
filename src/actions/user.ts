"use server";

import { auth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/handle-error";
import prisma from "@/lib/prisma";
import { TGetUserSchema } from "@/lib/search-params/search-user";
import { TRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { connection } from "next/server";

export async function getTotalUser() {
  await connection();
  try {
    const result = await prisma.user.count();
    return result;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 0;
  }
}

export async function getListUsers(input: TGetUserSchema) {
  try {
    const { users, total } = await auth.api.listUsers({
      query: {
        searchValue: input.name,
        searchField: "name",
        searchOperator: "contains",
        limit: input.perPage,
        offset: (input.page - 1) * input.perPage,
        sortBy: input.sort?.[0]?.id || "createdAt",
        sortDirection: input.sort?.[0]?.desc ? "desc" : "asc",
      },
      headers: await headers(),
    });

    return {
      data: {
        data: users,
        total,
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      data: {
        data: [],
        total: 0,
      },
    };
  }
}

export async function updateUsers({
  ids,
  role,
}: {
  ids: string[];
  role: TRole;
}) {
  try {
    const result = await prisma.user.updateManyAndReturn({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        role,
      },
      select: {
        name: true,
      },
    });

    revalidatePath("/dashboard/team");
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: getErrorMessage(error),
    };
  }
}

export async function deleteUsers({ ids }: { ids: string[] }) {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/dashboard/team");
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: getErrorMessage(error),
    };
  }
}
