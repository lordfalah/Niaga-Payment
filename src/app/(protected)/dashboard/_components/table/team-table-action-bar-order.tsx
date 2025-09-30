"use client";

import type { Table } from "@tanstack/react-table";
import {
  CheckCircle2,
  CheckCircle2Icon,
  Download,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import * as React from "react";

import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar";
import { Separator } from "@/components/ui/separator";
import { exportTableToCSV } from "@/lib/export";
import { toast } from "sonner";
import {
  deleteOrders,
  TGetOrdersWithFilters,
  updateOrders,
} from "@/actions/order";
import { TRole, TStatusOrder } from "@prisma/client";
import { showErrorToast } from "@/lib/handle-error";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { getEnumKeys } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actions = ["export", "delete", "update-status-transaction"] as const;
type Action = (typeof actions)[number];

interface OrderTableActionBarProps {
  table: Table<TGetOrdersWithFilters>;
}

export function OrderTableActionBar({ table }: OrderTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const { data, isPending: isPendingSession } = useSession();

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction],
  );

  const onTaskExport = React.useCallback(() => {
    setCurrentAction("export");
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ["select", "actions"],
        onlySelected: true,
      });
    });
  }, [table]);

  const onTaskDelete = React.useCallback(() => {
    setCurrentAction("delete");
    startTransition(async () => {
      const { error } = await deleteOrders({
        ids: rows.map((row) => row.original.id),
      });

      if (error) {
        toast.error(error);
        return;
      }
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table]);

  const onTaskUpdate = React.useCallback(
    ({ field, value }: { field: "status"; value: TStatusOrder }) => {
      setCurrentAction(field === "status" ? "update-status-transaction" : null);
      startTransition(async () => {
        const { error } = await updateOrders({
          ids: rows.map((row) => row.original.id),
          [field]: value,
          path: "/history",
        });

        if (error) {
          showErrorToast(error);
          return;
        }
        toast.success("Orders updated", {
          position: "top-center",
        });
      });
    },
    [rows],
  );

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        <Select
          onValueChange={(value: TStatusOrder) =>
            onTaskUpdate({ field: "status", value })
          }
        >
          <SelectTrigger className="border-secondary !bg-secondary/50 !h-fit p-1 [&>svg:last-of-type]:hidden">
            <DataTableActionBarAction
              asChild
              size="icon"
              tooltip="Update Status Transaction"
              isPending={getIsActionPending("update-status-transaction")}
              className="!size-5"
            >
              <CheckCircle2 />
            </DataTableActionBarAction>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {getEnumKeys(TStatusOrder).map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status === TStatusOrder.PAID && (
                    <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                  )}
                  {status === TStatusOrder.CANCELLED && <XCircle />}
                  {status === TStatusOrder.PENDING && <Loader2 />}

                  {status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
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
          isPending={getIsActionPending("delete") || isPendingSession}
          disabled={data ? data.user.role !== TRole.AUTHOR : false}
          onClick={onTaskDelete}
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
