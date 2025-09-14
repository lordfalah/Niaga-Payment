import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs/server";
import { getSortingStateParser } from "@/lib/parsers";
import { Order, TPayment, TStatusOrder } from "@/generated/prisma";
import z from "zod";
import { endOfMonth, startOfMonth } from "date-fns";

const today = new Date();
const startOfThisMonth = startOfMonth(today);
const endOfThisMonth = endOfMonth(today);

export const searchParamsCacheOrder = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Order>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  totalAmount: parseAsInteger,
  customerName: parseAsString.withDefault(""),
  payment: parseAsArrayOf(
    z.enum(Object.values(TPayment) as [TPayment, ...TPayment[]]),
  ).withDefault([]),
  status: parseAsArrayOf(
    z.enum(Object.values(TStatusOrder) as [TStatusOrder, ...TStatusOrder[]]),
  ).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetOrderSchema = Awaited<
  ReturnType<typeof searchParamsCacheOrder.parse>
>;

export const searchParamsCacheAnalytic = createSearchParamsCache({
  createdAtAnalytic: parseAsArrayOf(z.coerce.number()).withDefault([
    startOfThisMonth.getTime(),
    endOfThisMonth.getTime(),
  ]),
});

export type GetAnalyticSchema = Awaited<
  ReturnType<typeof searchParamsCacheAnalytic.parse>
>;
