import * as React from "react";
import Link from "next/link";
import { DashboardIcon, GearIcon } from "@radix-ui/react-icons";
import { abbreviationName, cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TRole } from "@/generated/prisma";
import { getServerSession } from "@/lib/get-session";
import { auth } from "@/lib/auth";
import { LogoutEverywhereButton } from "../logout-everywhere";
import { redirect } from "next/navigation";
import BtnSubmitWithLoad from "../btn-submit-load";

interface AuthDropdownProps
  extends React.ComponentPropsWithRef<typeof DropdownMenuTrigger>,
    ButtonProps {}

export async function AuthDropdown({ className, ...props }: AuthDropdownProps) {
  const session = await getServerSession();

  if (!session) {
    return (
      <form
        action={async () => {
          "use server";

          const res = await auth.api.signInSocial({
            body: {
              provider: "google",
              callbackURL: "/",
            },
          });

          if (res.url) {
            redirect(res.url as never);
          }
        }}
      >
        <BtnSubmitWithLoad
          variant="default"
          className={cn(className)}
          label="Sign In"
        />
      </form>
    );
  }

  const initial = abbreviationName(session.user.name ?? session.user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn("size-8 rounded-full", className)}
          {...props}
        >
          <Avatar className="size-8">
            <AvatarImage
              src={
                session.user.image
                  ? "session.user.image"
                  : "/images/logo/avatar-fallback.png"
              }
              alt={session.user.name ?? "avatar-fallback"}
            />

            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {session.user.name && (
              <p className="text-sm leading-none font-medium">
                {session.user.name}
              </p>
            )}
            <p className="text-muted-foreground text-xs leading-none">
              {session.user.email ?? ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <React.Suspense
          fallback={
            <div className="flex flex-col space-y-1.5 p-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full rounded-sm" />
              ))}
            </div>
          }
        >
          <AuthDropdownGroup role={session.user.role as TRole} />
        </React.Suspense>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutEverywhereButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function AuthDropdownGroup({ role }: { role: TRole }) {
  console.log(role);
  return (
    <DropdownMenuGroup>
      {/* Jika role adalah ADMIN ATAU SUPERADMIN, tampilkan Dashboard DAN Settings */}
      {(role === TRole.ADMIN ||
        role === TRole.SUPERADMIN ||
        role === TRole.AUTHOR) && (
        <React.Fragment>
          <DropdownMenuItem asChild>
            <Link href={"/dashboard"}>
              <DashboardIcon className="mr-2 size-4" aria-hidden="true" />
              Dashboard
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/setting">
              <GearIcon className="mr-2 size-4" aria-hidden="true" />
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </React.Fragment>
      )}

      {/* Jika role BUKAN ADMIN dan BUKAN SUPERADMIN, tapi masih perlu Settings (misal: USER biasa) */}
      {role === TRole.USER && (
        <DropdownMenuItem asChild>
          <Link href="/dashboard/setting">
            <GearIcon className="mr-2 size-4" aria-hidden="true" />
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
      )}
    </DropdownMenuGroup>
  );
}
