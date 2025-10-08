"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, CalendarSearch, Ellipsis, Text } from "lucide-react";
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
import {
  formatDateToMonthDayYear,
  getEnumKeys,
  toTitleCase,
} from "@/lib/utils";
import { UserWithRole } from "better-auth/plugins/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { admin } from "@/lib/auth-client";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/handle-error";
import { Label } from "@/components/ui/label";
import { TRole } from "@prisma/client";

interface GetTeamTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<UserWithRole> | null>
  >;
  dataUser: UserWithRole;
}

export function getTeamsTableColumns({
  setRowAction,
  dataUser,
}: GetTeamTableColumnsProps): ColumnDef<UserWithRole>[] {
  return [
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
      id: "avatar",
      accessorKey: "image",
      header: "Avatar",

      cell: ({ row }) => {
        const profileImg = row.original.image
          ? row.original.image
          : "https://github.com/shadcn.png";

        return (
          <Image
            className="size-8 rounded-lg sm:size-10"
            src={profileImg}
            alt={row.original.name}
            width={80}
            height={80}
            priority
          />
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    },

    {
      id: "email",
      accessorKey: "email",
      header: "Email",

      cell: ({ row }) => (
        <div className="w-40 text-wrap break-all">{row.original.email}</div>
      ),

      enableColumnFilter: true,
      enableSorting: true,
    },

    {
      accessorKey: "role",
      header: "Role",
      cell: function Cell({ row }) {
        const roles = getEnumKeys(TRole);
        const [pending, setPending] = React.useState(false);
        const router = useRouter();

        const changeRole = async (role: TRole) => {
          const { data: dataPermissions, error: errorPermissions } =
            await admin.hasPermission({
              permissions: {
                user: ["set-role"],
              },
            });

          if (!dataPermissions?.success) {
            toast.error(
              errorPermissions
                ? (errorPermissions.message ?? "forbidden")
                : "forbidden",
            );
          }

          await admin.setRole({
            userId: row.original.id,
            role: role as never,
            fetchOptions: {
              onRequest: () => setPending(true),
              onResponse: () => setPending(false),
              onError: (ctx) => {
                showErrorToast(ctx.error.message);
              },
              onSuccess: () => {
                toast.success(`User Role Updated`, {
                  position: "top-center",
                });
                router.refresh();
              },
            },
          });
        };

        return (
          <>
            <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
              Reviewer
            </Label>
            <Select
              disabled={
                pending ||
                [TRole.USER, TRole.ADMIN, TRole.SUPERADMIN].includes(
                  dataUser.role as never,
                )
              }
              defaultValue={row.original.role}
              onValueChange={changeRole}
            >
              <SelectTrigger
                className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
                size="sm"
                id={`${row.original.id}-reviewer`}
              >
                <SelectValue placeholder={row.original.role} />
              </SelectTrigger>
              <SelectContent align="end">
                {roles.map((role, idx) => {
                  const name = role.toLocaleLowerCase();
                  return (
                    <SelectItem key={`${role}-${idx}`} value={role}>
                      {toTitleCase(name)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </>
        );
      },
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
}
