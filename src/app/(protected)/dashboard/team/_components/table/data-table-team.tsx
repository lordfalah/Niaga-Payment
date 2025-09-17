"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarSearch, Text } from "lucide-react";
import { useMemo, useState } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import {
  formatDateToMonthDayYear,
  getEnumKeys,
  toTitleCase,
} from "@/lib/utils";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { parseAsInteger, useQueryStates } from "nuqs";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { type UserWithRole } from "better-auth/plugins/admin";
import { TeamTableActionBar } from "./team-table-action-bar-team";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRole } from "@/generated/prisma";
import { admin } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { showErrorToast } from "@/lib/handle-error";

const DataTableTeam: React.FC<{
  data: Array<UserWithRole>;
  total: number;
  dataUser: UserWithRole;
}> = ({ data, total, dataUser }) => {
  const columns = useMemo<ColumnDef<UserWithRole>[]>(
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
          const [pending, setPending] = useState(false);
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
              <Label
                htmlFor={`${row.original.id}-reviewer`}
                className="sr-only"
              >
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
    [dataUser],
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
      <DataTable table={table} actionBar={<TeamTableActionBar table={table} />}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="start" />
        </DataTableToolbar>
      </DataTable>
    </>
  );
};

export default DataTableTeam;
