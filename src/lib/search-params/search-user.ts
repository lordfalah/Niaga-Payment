import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { getSortingStateParser } from "@/lib/parsers";

import { UserWithRole } from "better-auth/plugins/admin";

export const searchParamsCacheUser = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<UserWithRole>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  email: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
});

export type GetProductSchema = Awaited<
  ReturnType<typeof searchParamsCacheUser.parse>
>;
