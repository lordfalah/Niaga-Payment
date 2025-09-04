"use server";

import ActionErrorHandler from "@/lib/action-error-handler";
import prisma from "@/lib/prisma";
import { createOrderSchema } from "@/validation/order.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function createOrderAction(body: unknown, userId: string) {
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return ActionErrorHandler.handleZod(parsed.error);
  }

  try {
    // Hitung totalAmount
    const products = await prisma.product.findMany({
      where: { id: { in: parsed.data.items.map((i) => i.productId) } },
    });

    const orderItems = parsed.data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Produk tidak ditemukan");

      return {
        productId: item.productId,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

    const order = await prisma.order.create({
      data: {
        customerName: parsed.data.customerName,
        totalAmount,
        userId,
        orderItems: {
          create: orderItems,
        },
      },
      include: { orderItems: true },
    });

    return {
      success: true,
      data: order,
      message: "Order berhasil dibuat",
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
