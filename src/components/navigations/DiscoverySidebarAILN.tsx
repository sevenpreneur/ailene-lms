"use client";

import type { LmsSession } from "@/apis/auth";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ThemeSwitcherAILN from "@/components/buttons/ThemeSwitcherAILN";
import { LogoAileneStrokeAILN } from "@/components/elements/LogoAileneStrokeAILN";
import { useSidebar } from "@/contexts/SidebarContext";
import { DeleteSession } from "@/lib/actions";
import { LOGIN_URL } from "@/lib/config";
import {
  Compass,
  GraduationCap,
  LayoutGrid,
  LogOut,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

type MenuItem = { name: string; url: string; icon: LucideIcon; exact?: boolean };

// Deliberately just Home/Explore/My Learning for now.
const MENU: MenuItem[] = [
  { name: "Home", url: "/", icon: LayoutGrid, exact: true },
  { name: "Explore", url: "/explore", icon: Compass },
  { name: "My Learning", url: "/my-learning", icon: GraduationCap },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-md text-sm transition-colors ${
        collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-1.5"
      } ${
        active
          ? "bg-linear-to-r from-[rgba(214,238,48,0.18)] to-transparent text-sb-item-active-text"
          : "text-sb-text hover:bg-linear-to-r hover:from-[rgba(214,238,48,0.1)] hover:to-transparent hover:text-sb-text-strong"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate font-medium">{label}</span>}
    </Link>
  );
}

export default function DiscoverySidebarAILN({
  session,
}: {
  session: LmsSession;
}) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = session.user;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const res = await DeleteSession();
      if (res.code === "NO_CONTENT") {
        router.push(LOGIN_URL);
      } else {
        toast.error("Gagal logout. Coba lagi.");
        setIsLoggingOut(false);
      }
    } catch {
      toast.error("Gagal logout. Coba lagi.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`fixed left-0 z-50 hidden h-full w-full flex-col border-r border-sb-border bg-sb-bg transition-[max-width] duration-150 lg:flex ${
        isCollapsed ? "max-w-16" : "max-w-64"
      }`}
    >
      <div
        className={`flex h-full w-full flex-col ${
          isCollapsed ? "px-2 py-4" : "p-4"
        }`}
      >
        {/* Logo + collapse toggle */}
        <div
          className={`flex shrink-0 items-center pb-4 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <LogoAileneStrokeAILN
            className={`w-auto shrink-0 -rotate-3 ${isCollapsed ? "h-7" : "h-9"}`}
          />

          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className={`flex size-8 shrink-0 items-center justify-center rounded-md border border-sb-border-soft text-sb-text transition-colors hover:bg-sb-item-hover hover:text-sb-text-strong ${
              isCollapsed ? "hidden" : ""
            }`}
          >
            <PanelLeft size={16} />
          </button>
        </div>

        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="mb-4 flex size-8 shrink-0 items-center justify-center self-center rounded-md border border-sb-border-soft text-sb-text transition-colors hover:bg-sb-item-hover hover:text-sb-text-strong"
          >
            <PanelLeft size={16} />
          </button>
        )}

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {MENU.map((item) => {
            const active = item.exact
              ? pathname === item.url
              : pathname.startsWith(item.url);

            return (
              <NavItem
                key={item.url}
                href={item.url}
                label={item.name}
                icon={item.icon}
                active={active}
                collapsed={isCollapsed}
              />
            );
          })}
        </nav>

        {/* Footer — signed-in user identity + theme + logout (no project state here) */}
        <div className="mt-3 shrink-0">
          {!isCollapsed ? (
            <div className="rounded-lg border border-sb-border-soft bg-sb-item-active-bg/40 p-3">
              <div className="flex items-center gap-3">
                <Image
                  src={user.avatar || DEFAULT_AVATAR}
                  alt={user.full_name}
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-sb-text-strong">
                    {user.full_name}
                  </div>
                  <div className="truncate text-xs text-sb-text">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end border-t border-sb-border-soft pt-2">
                <ThemeSwitcherAILN />
              </div>

              <ButtonAILN
                variant="light"
                size="small"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-2 w-full"
              >
                <LogOut className="size-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </ButtonAILN>
            </div>
          ) : (
            <Image
              src={user.avatar || DEFAULT_AVATAR}
              alt={user.full_name}
              width={36}
              height={36}
              unoptimized
              className="mx-auto size-9 rounded-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}
