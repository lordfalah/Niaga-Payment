import { TPayment, TStatusOrder } from "@prisma/client";
import z from "zod";

export const orderItemInputSchema = z.object({
  productId: z
    .string({ error: "Product harus diisi" })
    .min(6, "Product harus diisi"),
  quantity: z
    .number({ error: "Angka!" })
    .int()
    .min(1, "Minimal 1")
    .max(99, "Maximal 99"),
  // subtotal dihitung di server dari price * quantity → jangan terima dari client
});

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(3, "Nama pelanggan wajib diisi")
    .max(100, "Maksimal 100 karakter"),

  payment: z.enum(TPayment),
  status: z.enum(TStatusOrder),

  // admin pembuat order (id user)
  createdById: z
    .string({ error: "Created harus diisi" })
    .min(6, "Created harus diisi"),

  // daftar item
  items: z
    .array(orderItemInputSchema)
    .min(1, "Minimal 1 item dalam pesanan")
    .refine(
      (items) => {
        // Gaboleh ada productId duplikat—lebih rapi kalau gabung quantity dulu
        const set = new Set(items.map((i) => i.productId));
        return set.size === items.length;
      },
      { message: "Terdapat product yang duplikat dalam items" },
    ),
});

export const updateOrderItemsSchema = z.object({
  orderId: z.cuid(),
  // replace strategy: kirim ulang seluruh items order
  items: z
    .array(orderItemInputSchema)
    .min(1, "Minimal 1 item dalam pesanan")
    .refine(
      (items) => {
        const set = new Set(items.map((i) => i.productId));
        return set.size === items.length;
      },
      { message: "Terdapat product yang duplikat dalam items" },
    ),
});

export type TCreateOrderInput = z.infer<typeof createOrderSchema>;
export type TUpdateOrderItemsInput = z.infer<typeof updateOrderItemsSchema>;
