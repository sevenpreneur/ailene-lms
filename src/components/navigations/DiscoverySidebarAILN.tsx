"use client";

import type { LmsSession } from "@/apis/auth";
import { LogoAileneAILN } from "@/components/elements/LogoAileneAILN";
import SidebarNavItemAILN from "@/components/navigations/SidebarNavItemAILN";
import SidebarShellAILN, {
  SidebarGroupLabelAILN,
} from "@/components/navigations/SidebarShellAILN";
import SidebarUserMenuAILN from "@/components/navigations/SidebarUserMenuAILN";
import {
  Compass,
  GraduationCap,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

type MenuItem = {
  name: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
};

// Deliberately just Home/Explore/My Learning for now.
const MENU: MenuItem[] = [
  { name: "Home", url: "/", icon: LayoutGrid, exact: true },
  { name: "Explore", url: "/explore", icon: Compass },
  { name: "My Learning", url: "/my-learning", icon: GraduationCap },
];

export default function DiscoverySidebarAILN({
  session,
}: {
  session: LmsSession;
}) {
  const pathname = usePathname();

  return (
    <SidebarShellAILN
      mobileBrand={
        <LogoAileneAILN className="h-7 w-auto shrink-0 text-sb-text-strong" />
      }
      header={(collapsed) => (
        <div className={`flex items-center ${collapsed ? "py-1" : "px-1.5 py-1"}`}>
          <LogoAileneAILN
            className={`w-auto shrink-0 text-sb-text-strong ${collapsed ? "h-6" : "h-8"}`}
          />
        </div>
      )}
      nav={(collapsed) => (
        <>
          <SidebarGroupLabelAILN collapsed={collapsed}>
            Jelajah
          </SidebarGroupLabelAILN>
          {MENU.map((item) => (
            <SidebarNavItemAILN
              key={item.url}
              href={item.url}
              label={item.name}
              icon={item.icon}
              active={
                item.exact
                  ? pathname === item.url
                  : pathname.startsWith(item.url)
              }
              collapsed={collapsed}
            />
          ))}
        </>
      )}
      footer={(collapsed) => (
        <SidebarUserMenuAILN user={session.user} collapsed={collapsed} />
      )}
    />
  );
}
