import React from "react";
import { AppSidebar } from "@/app/(protected)/dashboard/_components/app-sidebar";
import { SiteHeader } from "@/app/(protected)/dashboard/_components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { TRole } from "@/generated/prisma";

const Dashboardlayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const [cookieStore, session] = await Promise.all([
    cookies(),
    getServerSession(),
  ]);

  if (
    !session ||
    session.user.role === TRole.USER ||
    session.user.role === TRole.ADMIN
  )
    redirect("/");

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={session.user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboardlayout;
