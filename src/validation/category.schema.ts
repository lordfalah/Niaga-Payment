import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(3, "Nama category wajib diisi")
    .max(100, "Maksimal 100 karakter"),
  description: z
    .string()
    .min(3, "minimal 3 kata")
    .trim()
    .max(10_000, "Deskripsi terlalu panjang"),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.cuid(),
});

export type TCreateCategoryInput = z.infer<typeof createCategorySchema>;
export type TUpdateCategoryInput = z.infer<typeof updateCategorySchema>;
