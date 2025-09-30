import * as React from "react";
import Link from "next/link";
import { DashboardIcon, ExitIcon, GearIcon } from "@radix-ui/react-icons";
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
import { TRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { LogoutEverywhereButton } from "../logout-everywhere";
import { redirect } from "next/navigation";
import BtnSubmitWithLoad from "../btn-submit-load";
import { UserWithRole } from "better-auth/plugins/admin";
import { Session } from "better-auth";
import { Skeleton } from "../ui/skeleton";
import { ShoppingCart } from "lucide-react";
import { headers } from "next/headers";

interface AuthDropdownProps
  extends React.ComponentPropsWithRef<typeof DropdownMenuTrigger>,
    ButtonProps {
  promisesession: Promise<{ session: Session; user: UserWithRole } | null>;
}

export async function AuthDropdown({ className, ...props }: AuthDropdownProps) {
  const session = await props.promisesession;

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
        <BtnSubmitWithLoad variant="default" className={cn(className)}>
          <span>Sign In</span>
        </BtnSubmitWithLoad>
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
                  ? session.user.image
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
        <DropdownMenuItem>
          <form
            className="w-full"
            action={async () => {
              "use server";

              await auth.api.signOut({ headers: await headers() });
            }}
          >
            <BtnSubmitWithLoad
              variant="destructive"
              className="flex w-full items-center justify-between gap-x-4"
            >
              <ExitIcon className="size-4" aria-hidden="true" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </BtnSubmitWithLoad>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function AuthDropdownGroup({ role }: { role: TRole }) {
  return (
    <DropdownMenuGroup>
      {/* Jika role adalah ADMIN ATAU SUPERADMIN, tampilkan Dashboard DAN Settings */}
      {(role === TRole.SUPERADMIN || role === TRole.AUTHOR) && (
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

      {(role === TRole.USER || role === TRole.ADMIN) && (
        <DropdownMenuItem asChild>
          <Link href="/setting">
            <GearIcon className="mr-2 size-4" aria-hidden="true" />
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
      )}

      {role === TRole.ADMIN && (
        <DropdownMenuItem asChild>
          <Link href="/history">
            <ShoppingCart className="mr-2 size-4" aria-hidden="true" />
            Riwayat Pesanan
          </Link>
        </DropdownMenuItem>
      )}
    </DropdownMenuGroup>
  );
}
