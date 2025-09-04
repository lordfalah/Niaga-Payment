"use client";

import { LoadingButton } from "@/components/loading-button";
import { revokeSessions } from "@/lib/auth-client";
import { ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DropdownMenuShortcut } from "./ui/dropdown-menu";

export function LogoutEverywhereButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogoutEverywhere() {
    setLoading(true);
    const { error } = await revokeSessions();
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to log out everywhere");
    } else {
      toast.success("Logged out from all devices");
      router.push("/");
      router.refresh();
    }
  }

  return (
    <LoadingButton
      variant="destructive"
      onClick={handleLogoutEverywhere}
      loading={loading}
      className="flex w-full items-center justify-between gap-x-4"
    >
      <ExitIcon className="size-4" aria-hidden="true" />
      Log out
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </LoadingButton>
  );
}
