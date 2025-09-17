"use server";

import {
  Order,
  Prisma,
  TPayment,
  TRole,
  TStatusOrder,
} from "@/generated/prisma";
import ActionErrorHandler from "@/lib/action-error-handler";
import { getServerSession } from "@/lib/get-session";
import { getErrorMessage } from "@/lib/handle-error";
import prisma from "@/lib/prisma";
import {
  GetAnalyticSchema,
  GetOrderSchema,
} from "@/lib/search-params/search-order";
import { buatStringQris } from "@/lib/utils";
import { TActionResult } from "@/types/action.type";
import { createOrderSchema } from "@/validation/order.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { after, connection } from "next/server";
import QRCode from "qrcode";

export async function getOrdersWithFilters(
  input: GetOrderSchema,
  userId?: string,
) {
  await connection();

  try {
    const {
      page,
      perPage,
      sort,
      totalAmount,
      customerName,
      status,
      createdAt,
      payment,
    } = input;

    const skip = (page - 1) * perPage;

    const orderBy = sort.length
      ? sort.map(({ id, desc }) => ({ [id]: desc ? "desc" : "asc" }))
      : [{ createdAt: "desc" }];

    // filter
    const where: Prisma.OrderWhereInput = {
      ...(userId && {
        userId,
      }),

      ...(customerName && {
        customerName: { contains: customerName, mode: "insensitive" },
      }),

      ...(totalAmount && {
        totalAmount,
      }),
      ...(status.length > 0 && {
        status: {
          in: status,
        },
      }),

      ...(payment.length > 0 && {
        payment: {
          in: payment,
        },
      }),

      ...(createdAt.length === 2 && {
        createdAt: {
          gte: new Date(createdAt[0]),
          lte: new Date(createdAt[1]),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    // 🔑 transform ke bentuk lebih mudah dipakai
    const formattedOrders = data.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      payment: order.payment,
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
      lineItems: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.quantity * item.product.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          category: item.product.category?.name,
        },
      })),
    }));

    return {
      status: true,
      message: "Orders fetched successfully",
      data: { data: formattedOrders, total, page, perPage },
    };
  } catch (err) {
    return {
      status: false,
      message: getErrorMessage(err) || "Failed to fetch Orders",
      data: { data: [], total: 0, page: 0, perPage: 0 },
    };
  }
}

export async function createOrderAction(
  body: unknown,
): Promise<TActionResult<Order>> {
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return ActionErrorHandler.handleZod(parsed.error);
  }

  try {
    const { customerName, payment, status, createdById, items } = parsed.data;

    // Hitung totalAmount
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Produk tidak ditemukan");

      return {
        productId: item.productId,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

    const orderData: Prisma.OrderCreateInput = {
      customerName,
      payment,
      status: payment === TPayment.CASH ? TStatusOrder.PAID : status,
      totalAmount,
      user: { connect: { id: createdById } }, // relasi ke User
      orderItems: { create: orderItems },
    };

    // Kalau pakai QRIS → generate QR
    if (payment === TPayment.QRIS) {
      if (!process.env.DATA_STATIS_QRIS) {
        return {
          status: false as const,
          message: "Konfigurasi QRIS belum diisi",
          errors: null,
        };
      }

      const stringQris = buatStringQris(totalAmount);
      const dataUrlQris = await QRCode.toDataURL(stringQris, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 256,
      });

      orderData.qrisData = dataUrlQris;
    }

    const order = await prisma.order.create({
      data: orderData,
      include: { orderItems: true },
    });

    revalidatePath("/dashboard");

    return {
      status: true,
      data: order,
      message: "Order berhasil dibuat",
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

export async function deleteOrders({ ids }: { ids: string[] }) {
  try {
    const Orders = await prisma.order.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/dashboard");
    return {
      status: true,
      data: Orders,
      error: null,
    };
  } catch (error) {
    return {
      status: false,
      data: null,
      error: getErrorMessage(error),
    };
  }
}

export async function getTotalRevenue() {
  await connection();
  try {
    const result = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: TStatusOrder.PAID,
      },
    });

    return result._sum.totalAmount || 0;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 0;
  }
}

export async function getTotalOrder() {
  await connection();
  try {
    const result = await prisma.order.count();
    return result;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 0;
  }
}

export async function getRevenueChartData(input: GetAnalyticSchema) {
  await connection();
  try {
    const { createdAtAnalytic } = input;

    const startDate = new Date(createdAtAnalytic[0]);
    const endDate = new Date(createdAtAnalytic[1]);
    const results = await prisma.order.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        status: TStatusOrder.PAID,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Prisma groupBy pada timestamp -> kita ubah ke string tanggal harian
    const data: Record<string, { totalOrders: number; totalRevenue: number }> =
      {};

    results.forEach((row) => {
      const date = row.createdAt.toISOString().split("T")[0]; // ambil YYYY-MM-DD
      if (!data[date]) {
        data[date] = { totalOrders: 0, totalRevenue: 0 };
      }
      data[date].totalOrders += row._count.id;
      data[date].totalRevenue += row._sum.totalAmount ?? 0;
    });

    return {
      status: true,
      data: Object.entries(data).map(([date, val]) => ({
        date,
        ...val,
      })),
      error: null,
    };
  } catch (error) {
    return {
      status: false,
      data: [
        {
          totalOrders: 0,
          totalRevenue: 0,
          date: new Date(Date.now()).toISOString().split("T")[0],
        },
      ],
      error: getErrorMessage(error),
    };
  }
}

/**
 * Update status order.
 */
export async function updateOrderStatus(orderId: string, status: TStatusOrder) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return {
      status: true,
      data: `Status order ${orderId} berhasil diubah ke ${status}`,
      error: null,
    };
  } catch (error) {
    return {
      status: false,
      data: null,
      error: getErrorMessage(error),
    };
  }
}
