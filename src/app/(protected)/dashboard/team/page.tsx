import { SearchParams } from "nuqs";
import React from "react";
import DataTableTeam from "./_components/table/data-table-team";
import { searchParamsCacheUser } from "@/lib/search-params/search-user";
import { getServerSession } from "@/lib/get-session";
import { TRole } from "@prisma/client";
import { unauthorized } from "next/navigation";
import { getListUsers } from "@/actions/user";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const DashboardPageTeam: React.FC<PageProps> = async ({ searchParams }) => {
  const search = searchParamsCacheUser.parse(await searchParams);

  const [session, { data: listUser }] = await Promise.all([
    getServerSession(),
    getListUsers(search),
  ]);

  if (
    !session ||
    session.user.role === TRole.USER ||
    session.user.role === TRole.ADMIN
  )
    unauthorized();
  const filterUsers = listUser.data.filter(({ role }) => {
    if (session.user.role === TRole.AUTHOR) {
      // Author tidak boleh lihat author lain
      return role !== TRole.AUTHOR;
    }

    if (session.user.role === TRole.SUPERADMIN) {
      // Superadmin hanya boleh lihat User dan Admin
      return role === TRole.USER || role === TRole.ADMIN;
    }

    // fallback → tampilkan semua
    return true;
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <DataTableTeam
          dataUser={session.user}
          data={filterUsers}
          total={listUser.total}
        />
      </div>
    </div>
  );
};

export default DashboardPageTeam;
