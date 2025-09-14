import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Nama produk wajib diisi")
    .max(100, "Maksimal 100 karakter"),
  description: z
    .string()
    .trim()
    .max(10_000, "Deskripsi terlalu panjang")
    .optional(),
  price: z.number().int().min(1000, "Harga tidak boleh negatif atau 0"),
  category: z
    .string()
    .min(3, "Nama category wajib diisi")
    .max(100, "Maksimal 100 karakter")
    .optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.cuid(),
});

export type TCreateProductInput = z.infer<typeof createProductSchema>;
export type TUpdateProductInput = z.infer<typeof updateProductSchema>;
