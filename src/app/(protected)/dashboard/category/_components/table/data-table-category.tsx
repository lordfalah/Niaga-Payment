"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarSearch, Text } from "lucide-react";
import { useMemo } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { formatDateToMonthDayYear } from "@/lib/utils";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { parseAsInteger, useQueryStates } from "nuqs";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { Category } from "@/generated/prisma";
import { CategoryTableActionBar } from "./team-table-action-bar-category";
import EditCategory from "../edit-category";

const DataTableCategory: React.FC<{
  data: Array<Category>;
  total: number;
}> = ({ data, total }) => {
  const columns = useMemo<ColumnDef<Category>[]>(
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
        id: "description",
        accessorKey: "description",
        header: "Description",

        cell: ({ row }) => (
          <div className="w-40 text-wrap break-all">
            {row.original.description}
          </div>
        ),

        enableColumnFilter: false,
        enableSorting: false,
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

        enableColumnFilter: false,
      },

      {
        id: "actions",
        cell: ({ row }) => {
          return <EditCategory data={row.original} />;
        },
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
        actionBar={<CategoryTableActionBar table={table} />}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="start" />
        </DataTableToolbar>
      </DataTable>
    </>
  );
};

export default DataTableCategory;
