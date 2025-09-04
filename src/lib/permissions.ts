import { TRole } from "@/generated/prisma";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
export const statement = {
  ...defaultStatements,
  product: ["create", "read", "update", "delete", "update:own", "delete:own"],
  order: ["create", "read", "update", "delete", "update:own", "delete:own"],
  category: ["create", "read", "update", "delete", "update:own", "delete:own"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
  [TRole.ADMIN]: ac.newRole({
    product: ["read"],
    order: ["create", "read", "update:own"],
    category: ["read"],
  }),

  [TRole.AUTHOR]: ac.newRole({
    ...adminAc.statements, // full akses default
    product: ["create", "read", "update", "delete", "update:own", "delete:own"],
    order: ["create", "read", "update", "delete", "update:own", "delete:own"],
    category: [
      "create",
      "read",
      "update",
      "delete",
      "update:own",
      "delete:own",
    ],
  }),

  [TRole.SUPERADMIN]: ac.newRole({
    product: ["create", "read", "update", "update:own", "delete:own"],
    order: ["read"],
    category: ["read"],
  }),
};
