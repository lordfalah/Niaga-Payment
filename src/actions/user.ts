import prisma from "@/lib/prisma";
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
