"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarSearch,
  CheckCircle,
  CheckCircle2Icon,
  Loader2,
  Text,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { formatDateToMonthDayYear, formatToRupiah } from "@/lib/utils";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { parseAsInteger, useQueryStates } from "nuqs";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { TStatusOrder } from "@/generated/prisma";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { OrderTableActionBar } from "./team-table-action-bar-order";
import DetailOrder from "../detail-order";
import { OrderWithLineItems } from "@/types/order.type";

const DataTableOrder: React.FC<{
  data: Array<OrderWithLineItems>;
  total: number;
}> = ({ data, total }) => {
  const columns = useMemo<ColumnDef<OrderWithLineItems>[]>(
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
        id: "customerName",
        accessorKey: "customerName",
        header: "Customer Name",

        cell: ({ row }) => (
          <div className="w-40 text-wrap break-all">
            {row.original.customerName}
          </div>
        ),

        meta: {
          label: "Customer Name",
          placeholder: "Search Customer...",
          variant: "text",
          icon: Text,
        },

        enableColumnFilter: true,
        enableSorting: false,
      },

      {
        id: "payment",
        accessorKey: "payment",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment" />
        ),

        cell: ({ row }) => {
          return (
            <div className="w-28 text-wrap break-all">
              {row.original.payment}
            </div>
          );
        },

        meta: {
          label: "Payment",
        },

        enableColumnFilter: true,
        enableSorting: true,
      },

      {
        id: "totalAmount",
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Price" />
        ),

        cell: ({ row }) => (
          <div className="w-28 text-wrap break-all">
            <p>Rp. {formatToRupiah(row.original.totalAmount)}</p>
          </div>
        ),

        meta: {
          label: "Total Price",
        },

        enableColumnFilter: true,
      },

      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status Transaction" />
        ),

        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="text-muted-foreground flex gap-1 px-1.5 capitalize [&_svg]:size-3"
          >
            {row.original.status === TStatusOrder.PAID && (
              <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
            )}
            {row.original.status === TStatusOrder.CANCELLED && <XCircle />}
            {row.original.status === TStatusOrder.PENDING && <Loader2 />}
            {row.original.status}
          </Badge>
        ),

        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            {
              label: "Paid",
              value: TStatusOrder.PAID,
              icon: CheckCircle,
            },
            {
              label: "Cancel",
              value: TStatusOrder.CANCELLED,
              icon: XCircle,
            },
            {
              label: "Pending",
              value: TStatusOrder.PENDING,
              icon: Loader2,
            },
          ],
        },
        enableColumnFilter: true,
      },

      {
        id: "userId",
        accessorKey: "userId",
        header: "Employer",

        cell: ({ row }) => {
          return (
            <div className="w-40 text-wrap break-all">
              {row.original.user.name}
            </div>
          );
        },
        meta: {
          label: "Employer",
        },

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

        enableColumnFilter: true,
      },

      {
        id: "actions",
        cell: ({ row }) => {
          return <DetailOrder data={row.original} />;
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
        actionBar={<OrderTableActionBar table={table} />}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="start" />
        </DataTableToolbar>
      </DataTable>
    </>
  );
};

export default DataTableOrder;
