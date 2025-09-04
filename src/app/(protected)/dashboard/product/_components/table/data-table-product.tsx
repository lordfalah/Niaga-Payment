"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarSearch, Text } from "lucide-react";
import { useMemo } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { formatDateToMonthDayYear, formatToRupiah } from "@/lib/utils";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { parseAsInteger, useQueryStates } from "nuqs";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { Product } from "@/generated/prisma";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { ProductTableActionBar } from "./product-table-action-bar";

const DataTableProduct: React.FC<{
  data: Array<Product>;
  total: number;
}> = ({ data, total }) => {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },

      {
        id: "no",
        header: "No",
        cell: ({ row }) => row.index + 1,
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },

      {
        id: "name",
        accessorKey: "name",
        header: "Name",

        cell: ({ row }) => (
          <div className="w-40 text-wrap break-all">{row.original.name}</div>
        ),

        meta: {
          label: "Name",
          placeholder: "Search Name...",
          variant: "text",
          icon: Text,
        },

        enableColumnFilter: true,
        enableSorting: false,
      },

      {
        id: "price",
        accessorKey: "price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),

        cell: ({ row }) => (
          <div className="w-28 text-wrap break-all">
            <p>Rp. {formatToRupiah(row.original.price)}</p>
          </div>
        ),

        meta: {
          label: "Price",
        },

        enableColumnFilter: true,
      },

      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <div className="w-40 text-wrap break-all">
            <p>{formatDateToMonthDayYear(row.original.createdAt)}</p>
          </div>
        ),

        meta: {
          label: "Date",
          placeholder: "Search date...",
          variant: "dateRange",
          icon: CalendarSearch,
        },

        enableColumnFilter: true,
      },

      {
        id: "actions",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Make a copy</DropdownMenuItem>
              <DropdownMenuItem>Favorite</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
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
    </>
  );
};

export default DataTableProduct;
