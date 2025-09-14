"use client";

import * as React from "react";
import {
  IconCategory,
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react";
import { NavMain } from "@/app/(protected)/dashboard/_components/nav-main";
import { NavSecondary } from "@/app/(protected)/dashboard/_components/nav-secondary";
import { NavUser } from "@/app/(protected)/dashboard/_components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { UserWithRole } from "better-auth/plugins/admin";
import { TRole } from "@/generated/prisma";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/images/logo/avatar-fallback.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      roles: [TRole.SUPERADMIN, TRole.AUTHOR],
    },
    {
      title: "Product",
      url: "/dashboard/product",
      icon: IconShoppingCart,
      roles: [TRole.SUPERADMIN, TRole.AUTHOR],
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: IconUsers,
      roles: [TRole.SUPERADMIN, TRole.AUTHOR],
    },
    {
      title: "Category",
      url: "/dashboard/category",
      icon: IconCategory,
      roles: [TRole.SUPERADMIN, TRole.AUTHOR],
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/setting",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserWithRole }) {
  const { role, image, name, email } = props.user;
  const navItems = data.navMain.filter((item) =>
    item.roles.includes(role as never),
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Niaga.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: image ? image : "https://github.com/shadcn.png",
            name,
            email,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
