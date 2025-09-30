"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarSearch,
  CheckCircle,
  CheckCircle2Icon,
  Ellipsis,
  Loader2,
  Text,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableRowAction } from "@/types/data-table";
import { TStatusOrder } from "@prisma/client";
import { formatDateToMonthDayYear, formatToRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TGetOrdersWithFilters } from "@/actions/order";

interface GetTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<TGetOrdersWithFilters> | null>
  >;
  orderBy?: boolean;
}

export function getOrdersTableColumns({
  setRowAction,
  orderBy = false,
}: GetTableColumnsProps): ColumnDef<TGetOrdersWithFilters>[] {
  const baseColumns: ColumnDef<TGetOrdersWithFilters>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
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
      cell: ({ row }) => (
        <div className="w-28 text-wrap break-all">{row.original.payment}</div>
      ),
      meta: { label: "Payment" },
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
      meta: { label: "Total Price" },
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
          { label: "Paid", value: TStatusOrder.PAID, icon: CheckCircle },
          { label: "Cancel", value: TStatusOrder.CANCELLED, icon: XCircle },
          { label: "Pending", value: TStatusOrder.PENDING, icon: Loader2 },
        ],
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
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="data-[state=open]:bg-muted flex size-8 p-0"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setRowAction({ row, variant: "delete" })}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];

  // Kondisional → hanya push kolom Employer jika orderBy === true
  if (orderBy) {
    baseColumns.splice(baseColumns.length - 2, 0, {
      id: "userId",
      accessorKey: "userId",
      header: "Employer",
      cell: ({ row }) => (
        <div className="w-40 text-wrap break-all">{row.original.user.name}</div>
      ),
      meta: { label: "Employer" },
      enableColumnFilter: false,
      enableSorting: false,
    });
  }

  return baseColumns;
}
