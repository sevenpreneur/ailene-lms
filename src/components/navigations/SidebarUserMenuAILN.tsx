"use client";

import type { LmsSession } from "@/apis/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteSession } from "@/lib/actions";
import { LOGIN_URL } from "@/lib/config";
import { ChevronsUpDown, LogOut, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

// One footer row for the signed-in user; theme and logout live in its menu instead of on the rail.
export default function SidebarUserMenuAILN({
  user,
  subtitle,
  collapsed,
}: {
  user: LmsSession["user"];
  subtitle?: string | null;
  collapsed: boolean;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const isDark = mounted && resolvedTheme === "dark";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const res = await DeleteSession();
      if (res.code === "NO_CONTENT") {
        router.push(LOGIN_URL);
        return;
      }
      toast.error("Gagal logout. Coba lagi.");
    } catch {
      toast.error("Gagal logout. Coba lagi.");
    }
    setIsLoggingOut(false);
  };

  const avatar = (
    <Image
      src={user.avatar || DEFAULT_AVATAR}
      alt={user.full_name}
      width={32}
      height={32}
      unoptimized
      className="size-8 shrink-0 rounded-full object-cover"
    />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={collapsed ? user.full_name : undefined}
        className={`flex items-center rounded-lg text-left outline-none transition-colors hover:bg-sb-item-hover focus-visible:bg-sb-item-hover data-[state=open]:bg-sb-item-hover ${
          collapsed ? "p-1" : "w-full gap-2.5 p-1.5"
        }`}
      >
        {avatar}
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-sb-text-strong">
                {user.full_name}
              </span>
              <span className="block truncate text-xs text-sb-text">
                {subtitle || user.email}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-sb-text" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align={collapsed ? "end" : "start"}
        className={collapsed ? "" : "w-[var(--radix-dropdown-menu-trigger-width)]"}
      >
        <DropdownMenuLabel className="flex items-center gap-2.5 text-foreground">
          {avatar}
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {user.full_name}
            </span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setTheme(isDark ? "light" : "dark")}>
          <Moon className="text-muted-foreground" />
          <span className="flex-1">Mode gelap</span>
          <span
            aria-hidden
            className={`relative h-4 w-7 rounded-full transition-colors ${
              isDark ? "bg-claude dark:bg-lime-bright" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-all ${
                isDark ? "left-3.5" : "left-0.5"
              }`}
            />
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut />
          {isLoggingOut ? "Keluar..." : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
