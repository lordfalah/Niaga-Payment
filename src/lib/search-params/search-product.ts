import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs/server";
import { getSortingStateParser } from "@/lib/parsers";
import { Product } from "@prisma/client";
import z from "zod";

export const searchParamsCacheProduct = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Product>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  price: parseAsInteger,
  name: parseAsString.withDefault(""),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetProductSchema = Awaited<
  ReturnType<typeof searchParamsCacheProduct.parse>
>;
