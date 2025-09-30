"use client";

import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import { ArrowUp, CheckCircle2, Download, Trash2 } from "lucide-react";
import * as React from "react";

import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getEnumKeys } from "@/lib/utils";
import { toast } from "sonner";
import { Product } from "@prisma/client";
import { exportTableToCSV } from "@/lib/export";
import { UserWithRole } from "better-auth/plugins/admin";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actions = [
  "update-laundry-status",
  "update-priority",
  "export",
  "delete",
] as const;

type Action = (typeof actions)[number];

interface OrderTableActionBarProps {
  table: Table<UserWithRole>;
}

export function TeamTableActionBar({ table }: OrderTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction],
  );

  // const onOrderUpdate = React.useCallback(
  //   ({
  //     field,
  //     value,
  //   }: {
  //     field: "laundryStatus" | "priority";
  //     value: TLaundryStatus | TPriority;
  //   }) => {
  //     setCurrentAction(
  //       field === "laundryStatus" ? "update-laundry-status" : "update-priority",
  //     );
  //     startTransition(async () => {
  //       const { error } = await updateOrders({
  //         ids: rows.map((row) => row.original.id),
  //         [field]: value,
  //       });

  //       if (error) {
  //         toast.error(error);
  //         return;
  //       }
  //       toast.success("Orders updated");
  //     });
  //   },
  //   [rows],
  // );

  const onTaskExport = React.useCallback(() => {
    setCurrentAction("export");
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ["select", "actions"],
        onlySelected: true,
      });
    });
  }, [table]);

  // const onTaskDelete = React.useCallback(() => {
  //   setCurrentAction("delete");
  //   startTransition(async () => {
  //     const { error } = await deleteOrders({
  //       ids: rows.map((row) => row.original.id),
  //     });

  //     if (error) {
  //       toast.error(error);
  //       return;
  //     }
  //     table.toggleAllRowsSelected(false);
  //   });
  // }, [rows, table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        <Select>
          <SelectTrigger asChild>
            <DataTableActionBarAction
              size="icon"
              tooltip="Update Status Laundry"
              isPending={getIsActionPending("update-laundry-status")}
            >
              <CheckCircle2 />
            </DataTableActionBarAction>
          </SelectTrigger>
          {/* <SelectContent align="center">
            <SelectGroup>
              {getEnumKeys(TLaundryStatus).map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent> */}
        </Select>
        <Select>
          <SelectTrigger asChild>
            <DataTableActionBarAction
              size="icon"
              tooltip="Update priority"
              isPending={getIsActionPending("update-priority")}
            >
              <ArrowUp />
            </DataTableActionBarAction>
          </SelectTrigger>
          {/* <SelectContent align="center">
            <SelectGroup>
              {getEnumKeys(TPriority).map((priority) => (
                <SelectItem
                  key={priority}
                  value={priority}
                  className="capitalize"
                >
                  {priority}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent> */}
        </Select>
        <DataTableActionBarAction
          size="icon"
          tooltip="Export Orders"
          isPending={getIsActionPending("export")}
          onClick={onTaskExport}
        >
          <Download />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          size="icon"
          tooltip="Delete Orders"
          isPending={getIsActionPending("delete")}
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
