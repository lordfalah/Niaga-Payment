import { SearchParams } from "nuqs";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DataTableTeam from "./_components/table/data-table-team";
import { searchParamsCacheUser } from "@/lib/search-params/search-user";
import { getServerSession } from "@/lib/get-session";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const DashboardPageTeam: React.FC<PageProps> = async ({ searchParams }) => {
  const search = searchParamsCacheUser.parse(await searchParams);

  const [{ users, total }, session] = await Promise.all([
    auth.api.listUsers({
      query: {
        searchValue: search.name,
        searchField: "name",
        searchOperator: "contains",

        limit: search.perPage,
        offset: (search.page - 1) * search.perPage,
        sortBy: search.sort?.[0]?.id || "createdAt",
        sortDirection: search.sort?.[0]?.desc ? "desc" : "asc",
      },
      headers: await headers(),
    }),
    getServerSession(),
  ]);

  if (!session) throw new Error("Not Authorized");

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <DataTableTeam dataUser={session.user} data={users} total={total} />
      </div>
    </div>
  );
};

export default DashboardPageTeam;
