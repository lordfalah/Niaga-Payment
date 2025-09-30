"use client";

import { useMemo, useState } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { parseAsInteger, useQueryStates } from "nuqs";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { OrderTableActionBar } from "./team-table-action-bar-order";
import { DataTableRowAction } from "@/types/data-table";
import { getOrdersTableColumns } from "./order-table-columns";
import { DeleteOrdersDialog } from "./delete-order-dialog";
import { TGetOrdersWithFilters } from "@/actions/order";

const DataTableOrder: React.FC<{
  data: Array<TGetOrdersWithFilters>;
  total: number;
  orderBy: boolean;
}> = ({ data, total, orderBy = true }) => {
  const [rowAction, setRowAction] =
    useState<DataTableRowAction<TGetOrdersWithFilters> | null>(null);

  const columns = useMemo(
    () =>
      getOrdersTableColumns({
        setRowAction,
        orderBy,
      }),
    [orderBy],
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
      <DataTable
        table={table}
        actionBar={<OrderTableActionBar table={table} />}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="start" />
        </DataTableToolbar>
      </DataTable>

      <DeleteOrdersDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        orders={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default DataTableOrder;
