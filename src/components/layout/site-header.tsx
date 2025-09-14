import { siteConfig } from "@/config/site";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { AuthDropdown } from "./auth-dropdown";
import { ModeToggle } from "./mode-toggle";
import { getServerSession } from "@/lib/get-session";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";

export async function SiteHeader() {
  const promisesession = getServerSession();

  return (
    <header className="bg-background/50 fixed top-0 z-50 w-full border-b border-white/[0.08] backdrop-blur-md backdrop-filter">
      <div className="container flex h-16 items-center">
        <MainNav items={siteConfig.mainNav} />
        <MobileNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {/* <ProductsCombobox />
            <InvoiceCart />
            <CartSheet />
            <AuthDropdown /> */}

            <ModeToggle />

            <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
              <AuthDropdown promisesession={promisesession} />
            </Suspense>
          </nav>
        </div>
      </div>
    </header>
  );
}
