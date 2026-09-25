"use client";

import type { LmsProjectRole, LmsSession } from "@/apis/auth";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ThemeSwitcherAILN from "@/components/buttons/ThemeSwitcherAILN";
import { useSidebar } from "@/contexts/SidebarContext";
import { DeleteSession } from "@/lib/actions";
import { LOGIN_URL } from "@/lib/config";
import { useProjectId } from "@/lib/use-project-id";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  PanelLeft,
  PlusCircle,
  Target,
  UserRound,
  UserRoundKey,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type SidebarAILNVariant = "STUDENT" | "CHAMPION" | "SPONSOR";

type MenuItem = {
  name: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
};

type VariantConfig = {
  dashboardName: string;
  menu: MenuItem[];
  // Mode-badge dot — the one deliberate spot of per-role color left in the sidebar.
  dotClassName: string;
  dotPulseColor: string;
};

// OnDark logos are white; the champion light surface needs the regular ones.
const HUTAMA_KARYA_LOGO_ON_DARK =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-danantara-white.webp";
const HUTAMA_KARYA_LOGO_ON_LIGHT =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-danantara.webp";
const HUTAMA_KARYA_LOGO_SQUARE_ON_DARK =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-white-square.webp";
const HUTAMA_KARYA_LOGO_SQUARE_ON_LIGHT =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-square.webp";
const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

const VARIANT_CONFIG: Record<SidebarAILNVariant, VariantConfig> = {
  STUDENT: {
    dashboardName: "Dashboard Student",
    dotClassName: "bg-red-500",
    dotPulseColor: "rgba(239,68,68,0.55)",
    menu: [
      { name: "Hari Ini", url: "/student", icon: CalendarDays, exact: true },
      {
        name: "Pre Assessment",
        url: "/student/pre-assessment",
        icon: Gauge,
      },
      {
        name: "Jalur Belajar",
        url: "/student/learning-path",
        icon: BookOpen,
        exact: true,
      },
      {
        name: "Latihan Skill",
        url: "/student/skill-practice",
        icon: ClipboardList,
      },
      { name: "Progress Saya", url: "/student/my-progress", icon: LineChart },
    ],
  },
  CHAMPION: {
    dashboardName: "Dashboard Champion",
    dotClassName: "bg-claude dark:bg-lime-bright",
    dotPulseColor: "rgba(214,238,48,0.55)",
    menu: [
      {
        name: "Team Overview",
        url: "/champion",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        name: "Pre Assessment Report",
        url: "/champion/pre-assessment",
        icon: Gauge,
      },
      { name: "Assignment", url: "/champion/assignment", icon: BookMarked },
      {
        name: "Review Tugas",
        url: "/champion/submissions",
        icon: ClipboardCheck,
      },
    ],
  },
  SPONSOR: {
    dashboardName: "Dashboard Sponsor",
    dotClassName: "bg-sky-300",
    dotPulseColor: "rgba(125,211,252,0.55)",
    menu: [
      {
        name: "Executive Overview",
        url: "/sponsor",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        name: "Pre Assessment",
        url: "/sponsor/pre-assessment",
        icon: ClipboardCheck,
      },
      {
        name: "Workforce",
        url: "/sponsor/workforce",
        icon: BarChart3,
      },
      { name: "ROI Productivity", url: "/sponsor/roi", icon: Target },
    ],
  },
};

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
        collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2.5 lg:py-1.5"
      } ${
        active
          ? "bg-linear-to-r from-sb-glow to-transparent text-sb-item-active-text"
          : "text-sb-text hover:bg-linear-to-r hover:from-sb-glow-soft hover:to-transparent hover:text-sb-text-strong"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate font-medium">{label}</span>}
    </Link>
  );
}

export default function SidebarAILN({
  session,
  variant,
  projectId: projectIdProp,
}: {
  session: LmsSession;
  variant: SidebarAILNVariant;
  projectId?: string;
}) {
  const config = VARIANT_CONFIG[variant];
  const projectId = useProjectId(projectIdProp);
  const { isCollapsed, toggleSidebar, isMobileOpen, openMobile, closeMobile } =
    useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = session.user;
  const projectAccess = session.project_access.find(
    (project) => project.id === projectId,
  );

  // Navigating away should never leave the drawer covering the new page.
  useEffect(() => {
    closeMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes the drawer, matching every other overlay in the app.
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileOpen, closeMobile]);

  // Only the champion sidebar follows the app theme; student and sponsor stay forest.
  const onLightSurface = variant === "CHAMPION";
  const squareLogo: LogoPair = projectAccess?.avatar
    ? { onDark: projectAccess.avatar, onLight: projectAccess.avatar }
    : {
        onDark: HUTAMA_KARYA_LOGO_SQUARE_ON_DARK,
        onLight: HUTAMA_KARYA_LOGO_SQUARE_ON_LIGHT,
      };
  const wideLogo: LogoPair = projectAccess?.avatar
    ? squareLogo
    : {
        onDark: HUTAMA_KARYA_LOGO_ON_DARK,
        onLight: HUTAMA_KARYA_LOGO_ON_LIGHT,
      };
  const logo = isCollapsed ? squareLogo : wideLogo;
  const projectName = projectAccess?.name ?? "Project";

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

  const groupName = projectAccess?.group_name ?? "-";

  const navLinks = (collapsed: boolean) => (
    <>
      {config.menu.map((item) => {
        const url = `/${projectId}${item.url}`;
        const active = item.exact ? pathname === url : pathname.startsWith(url);

        return (
          <NavItem
            key={item.url}
            href={url}
            label={item.name}
            icon={item.icon}
            active={active}
            collapsed={collapsed}
          />
        );
      })}

      {variant === "STUDENT" && (
        <>
          <div className="my-1 border-t border-sb-border-soft" />
          <NavItem
            href={`/${projectId}/student/skill-practice/create`}
            label="Catat Use Case"
            icon={PlusCircle}
            active={false}
            collapsed={collapsed}
          />
        </>
      )}
    </>
  );

  const modeBadge = (collapsed: boolean) => (
    <div
      className={`mb-4 flex items-center rounded-full border border-sb-chip-border bg-sb-chip-bg ${
        collapsed ? "justify-center p-2" : "gap-2 px-3 py-2"
      }`}
    >
      <span
        className={`ailn-dot-pulse size-2 shrink-0 rounded-full ring-2 ring-white/80 ${config.dotClassName}`}
        style={{ "--pulse-color": config.dotPulseColor } as React.CSSProperties}
      />
      {!collapsed && (
        <span className="text-xs font-semibold text-sb-chip-text">
          {config.dashboardName}
        </span>
      )}
    </div>
  );

  const footerCard = (
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
          <div className="truncate text-xs text-sb-text">{user.job_title}</div>
        </div>
      </div>

      <div className="mt-2 border-t border-sb-border-soft pt-2">
        <IdentityMeta
          variant={variant}
          groupName={groupName}
          projectName={projectAccess?.name ?? "-"}
        />
      </div>

      <RoleSwitch
        variant={variant}
        memberRole={projectAccess?.role}
        projectId={projectId}
      />

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
  );

  return (
    <div className={onLightSurface ? "sidebar-champion contents" : "contents"}>
      {/* ---------- Mobile top bar (<lg) ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-sb-border bg-sb-bg px-4 lg:hidden">
        <button
          onClick={openMobile}
          aria-label="Buka menu"
          aria-expanded={isMobileOpen}
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-sb-border-soft text-sb-text transition-colors hover:bg-sb-item-hover hover:text-sb-text-strong"
        >
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-sm bg-sb-logo-frame ring-1 ring-sb-border-soft">
            <SidebarLogo
              logo={squareLogo}
              onLightSurface={onLightSurface}
              alt={projectName}
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-sb-text-strong">
              {projectAccess?.name ?? "Project"}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`size-1.5 shrink-0 rounded-full ${config.dotClassName}`}
              />
              <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-sb-text/70">
                {config.dashboardName}
              </span>
            </div>
          </div>
        </div>

        <ThemeSwitcherAILN />
      </header>

      {/* ---------- Mobile drawer (<lg) ---------- */}
      <div
        inert={!isMobileOpen}
        className={`fixed inset-0 z-[60] lg:hidden ${
          isMobileOpen ? "" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Tutup menu"
          onClick={closeMobile}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className={`absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-sb-border bg-sb-bg transition-transform duration-200 ease-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full w-full flex-col p-4">
            <div className="flex shrink-0 items-center justify-between gap-2 pb-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-sm bg-sb-logo-frame ring-2 ring-sb-border-soft">
                  <SidebarLogo
                    logo={squareLogo}
                    onLightSurface={onLightSurface}
                    alt={projectName}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-sb-text-strong">
                    {projectAccess?.name ?? "Project"}
                  </div>
                  <div className="text-[9px] font-light uppercase tracking-wider text-sb-text/60">
                    Powered by Ailene
                  </div>
                </div>
              </div>

              <button
                onClick={closeMobile}
                aria-label="Tutup menu"
                className="flex size-8 shrink-0 items-center justify-center rounded-md border border-sb-border-soft text-sb-text transition-colors hover:bg-sb-item-hover hover:text-sb-text-strong"
              >
                <X size={16} />
              </button>
            </div>

            {modeBadge(false)}

            <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
              {navLinks(false)}
            </nav>

            <div className="mt-3 shrink-0">{footerCard}</div>
          </div>
        </div>
      </div>

      {/* ---------- Desktop rail (lg+) ---------- */}
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
          {/* Logo + project name + menu toggle */}
          <div
            className={`flex shrink-0 items-center pb-4 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isCollapsed && (
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-sm bg-sb-logo-frame ring-2 ring-sb-border-soft">
                  <SidebarLogo
                    logo={logo}
                    onLightSurface={onLightSurface}
                    alt={projectName}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-sb-text-strong">
                    {projectAccess?.name ?? "Project"}
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-sb-text/60">
                    Powered by Ailene
                  </div>
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="relative size-9 shrink-0 overflow-hidden rounded bg-sb-logo-frame ring-1 ring-sb-border-soft">
                <SidebarLogo
                  logo={logo}
                  onLightSurface={onLightSurface}
                  alt={projectName}
                />
              </div>
            )}

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

          {/* Mode badge */}
          {modeBadge(isCollapsed)}

          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {navLinks(isCollapsed)}
          </nav>

          {/* Footer — user identity + group + role mode + logout */}
          <div className="mt-3 shrink-0">
            {!isCollapsed ? (
              footerCard
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
    </div>
  );
}

type LogoPair = { onDark: string; onLight: string };

// On the champion themed surface, swap to the white logo only in dark mode.
function SidebarLogo({
  logo,
  onLightSurface,
  alt,
}: {
  logo: LogoPair;
  onLightSurface: boolean;
  alt: string;
}) {
  if (!onLightSurface || logo.onDark === logo.onLight) {
    return (
      <Image
        src={logo.onDark}
        alt={alt}
        fill
        unoptimized
        className="object-cover"
      />
    );
  }

  return (
    <>
      <Image
        src={logo.onLight}
        alt={alt}
        fill
        unoptimized
        className="object-cover dark:hidden"
      />
      <Image
        src={logo.onDark}
        alt={alt}
        fill
        unoptimized
        className="hidden object-cover dark:block"
      />
    </>
  );
}

function IdentityMeta({
  variant,
  groupName,
  projectName,
}: {
  variant: SidebarAILNVariant;
  groupName: string;
  projectName: string;
}) {
  if (variant === "SPONSOR") {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs tracking-wide text-sb-text">
          {projectName}
        </span>
        <ThemeSwitcherAILN />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-sb-text/70">
          Group
        </div>
        <div className="truncate text-xs font-medium text-sb-text-strong">
          {groupName}
        </div>
      </div>
      <ThemeSwitcherAILN />
    </div>
  );
}

// Only a champion gets a switch: into their student view, and back out of it.
function RoleSwitch({
  variant,
  memberRole,
  projectId,
}: {
  variant: SidebarAILNVariant;
  memberRole?: LmsProjectRole;
  projectId: string;
}) {
  if (variant === "STUDENT" && memberRole === "champion") {
    return (
      <Link href={`/${projectId}/champion`} className="mt-2 block">
        <ButtonAILN variant="lime" size="small" className="w-full">
          <UserRoundKey className="size-4" />
          Mode Champion
        </ButtonAILN>
      </Link>
    );
  }

  if (variant === "CHAMPION") {
    return (
      <Link href={`/${projectId}/student`} className="mt-2 block">
        <ButtonAILN variant="lime" size="small" className="w-full">
          <UserRound className="size-4" />
          Mode Student
        </ButtonAILN>
      </Link>
    );
  }

  return null;
}
