import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs/server";
import { getSortingStateParser } from "@/lib/parsers";
import { Category } from "@/generated/prisma";
import z from "zod";

export const searchParamsCacheCategory = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Category>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetCategorySchema = Awaited<
  ReturnType<typeof searchParamsCacheCategory.parse>
>;
