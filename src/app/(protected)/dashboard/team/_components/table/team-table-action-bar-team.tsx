"use client";

import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import { Download, Trash2 } from "lucide-react";
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
import { TRole } from "@prisma/client";
import { exportTableToCSV } from "@/lib/export";
import { UserWithRole } from "better-auth/plugins/admin";
import { IconUserShield } from "@tabler/icons-react";
import { deleteUsers, updateUsers } from "@/actions/user";
import { showErrorToast } from "@/lib/handle-error";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actions = ["update-role", "export", "delete"] as const;

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

  const onUserUpdate = React.useCallback(
    ({ field, value }: { field: "role"; value: TRole }) => {
      setCurrentAction("update-role");
      startTransition(async () => {
        const { error, data } = await updateUsers({
          ids: rows.map((row) => row.original.id),
          [field]: value,
        });

        if (error) {
          showErrorToast(error);
          return;
        }
        toast.success(`Users updated total : ${data.length} `);
      });
    },
    [rows],
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
      const { error } = await deleteUsers({
        ids: rows.map((row) => row.original.id),
      });

      if (error) {
        toast.error(error);
        return;
      }
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        <Select
          onValueChange={(value: TRole) =>
            onUserUpdate({ field: "role", value })
          }
        >
          <SelectTrigger asChild>
            <DataTableActionBarAction
              size="icon"
              tooltip="Update Role"
              isPending={getIsActionPending("update-role")}
            >
              <IconUserShield />
            </DataTableActionBarAction>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {getEnumKeys(TRole)
                .filter((role) => role !== TRole.AUTHOR)
                .map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {role}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DataTableActionBarAction
          size="icon"
          tooltip="Export Teams"
          isPending={getIsActionPending("export")}
          onClick={onTaskExport}
        >
          <Download />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          size="icon"
          tooltip="Delete Teams"
          isPending={getIsActionPending("delete")}
          onClick={onTaskDelete}
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
