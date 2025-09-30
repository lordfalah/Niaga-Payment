"use client";

import { useMemo, useState } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { parseAsInteger, useQueryStates } from "nuqs";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { Category, Product } from "@prisma/client";
import { ProductTableActionBar } from "./product-table-action-bar";
import { DeleteProductsDialog } from "./delete-product-dialog";
import { DataTableRowAction } from "@/types/data-table";
import { getProductsTableColumns } from "./product-table-columns";
import UpdateProductSheet from "./update-product-sheet";

const DataTableProduct: React.FC<{
  data: Array<Product & { category: Category | null }>;
  total: number;
  categorys: Category[];
}> = ({ data, total, categorys }) => {
  const [rowAction, setRowAction] = useState<DataTableRowAction<
    Product & { category: Category | null }
  > | null>(null);

  const columns = useMemo(
    () =>
      getProductsTableColumns({
        setRowAction,
      }),
    [],
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
        actionBar={<ProductTableActionBar table={table} />}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="start" />
        </DataTableToolbar>
      </DataTable>

      <UpdateProductSheet
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        product={rowAction?.row.original ?? null}
        categorys={categorys}
      />

      <DeleteProductsDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        products={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
};

export default DataTableProduct;
