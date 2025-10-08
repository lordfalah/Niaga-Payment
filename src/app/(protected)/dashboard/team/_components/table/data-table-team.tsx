"use client";

import { useMemo, useState } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { parseAsInteger, useQueryStates } from "nuqs";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { type UserWithRole } from "better-auth/plugins/admin";
import { TeamTableActionBar } from "./team-table-action-bar-team";
import { DataTableRowAction } from "@/types/data-table";
import { getTeamsTableColumns } from "./team-table-columns";
import { DeleteTeamsDialog } from "./delete-team-dialog";

const DataTableTeam: React.FC<{
  data: Array<UserWithRole>;
  total: number;
  dataUser: UserWithRole;
}> = ({ data, total, dataUser }) => {
  const [rowAction, setRowAction] =
    useState<DataTableRowAction<UserWithRole> | null>(null);

  const columns = useMemo(
    () =>
      getTeamsTableColumns({
        setRowAction,
        dataUser,
      }),
    [dataUser],
  );

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
  });

  const currentPage = params.page;
  const currentPerPage = params.perPage;

  const calculatedPageCount = useMemo(() => {
    if (total === 0) return 1;
    return Math.ceil(total / currentPerPage);
  }, [total, currentPerPage]);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: calculatedPageCount,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: currentPerPage,
      },
    },
    shallow: false,
    clearOnDefault: true,
    getRowId: (row) => row.id,
  });

  return (
    <>
      <DataTable table={table} actionBar={<TeamTableActionBar table={table} />}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="start" />
        </DataTableToolbar>
      </DataTable>

      <DeleteTeamsDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        users={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default DataTableTeam;
