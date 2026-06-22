"use client";

import ButtonAILN, { type VariantType } from "@/components/buttons/ButtonAILN";
import ThemeSwitcherAILN from "@/components/buttons/ThemeSwitcherAILN";
import { useSidebar } from "@/contexts/SidebarContext";
import { DeleteSession } from "@/lib/actions";
import { LOGIN_URL } from "@/lib/config";
import { setSessionToken, trpc } from "@/trpc/client";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  LineChart,
  LogOut,
  Megaphone,
  PlusCircle,
  Target,
  UserRound,
  UserRoundKey,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
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
  buttonVariant: VariantType;
  dashboardName: string;
  menu: MenuItem[];
  classes: {
    sidebar: string;
    toggle: string;
    toggleIcon: string;
    mode: string;
    modeDot: string;
    modeText: string;
    active: string;
    activeBar: string;
    userCard: string;
    userAvatar: string;
    divider: string;
    metaText: string;
  };
};

const INACTIVE_CLASSES =
  "text-gray-600 hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white";

const HUTAMA_KARYA_LOGO =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-danantara.webp";
const HUTAMA_KARYA_LOGO_SQUARE =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-square.webp";
const HUTAMA_KARYA_LOGO_DARK =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-danantara-white.webp";
const HUTAMA_KARYA_LOGO_SQUARE_DARK =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-white-square.webp";
const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

const VARIANT_CONFIG: Record<SidebarAILNVariant, VariantConfig> = {
  STUDENT: {
    buttonVariant: "primary",
    dashboardName: "Dashboard Student",
    menu: [
      { name: "Hari Ini", url: "/student", icon: CalendarDays, exact: true },
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
    classes: {
      sidebar:
        "dark:border-red-500/20 dark:shadow-[2px_0_24px_rgba(239,68,68,0.08)]",
      toggle:
        "dark:border-red-500/40 dark:bg-black dark:shadow-[0_0_8px_rgba(239,68,68,0.4)]",
      toggleIcon: "dark:text-red-400",
      mode: "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:shadow-[0_0_12px_rgba(239,68,68,0.15)]",
      modeDot: "bg-red-500 dark:shadow-[0_0_8px_rgba(239,68,68,0.9)]",
      modeText: "text-red-600 dark:text-red-200",
      active: "bg-gray-200 text-black dark:bg-white/10 dark:text-white",
      activeBar: "bg-black dark:bg-white",
      userCard: "bg-card-1 dark:bg-card-1/60",
      userAvatar: "",
      divider: "",
      metaText: "dark:text-white",
    },
  },
  CHAMPION: {
    buttonVariant: "champion",
    dashboardName: "Dashboard Champion",
    menu: [
      {
        name: "Team Overview",
        url: "/champion",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        name: "Pre Assessment",
        url: "/champion/pre-assessment",
        icon: Gauge,
      },
      { name: "Assignment", url: "/champion/assignment", icon: BookMarked },
      {
        name: "Review Tugas",
        url: "/champion/submissions",
        icon: ClipboardCheck,
      },
      { name: "Reports", url: "/champion/report", icon: FileText },
    ],
    classes: {
      sidebar:
        "dark:border-emerald-500/20 dark:shadow-[2px_0_24px_rgba(16,185,129,0.08)]",
      toggle:
        "dark:border-emerald-500/40 dark:bg-black dark:shadow-[0_0_8px_rgba(16,185,129,0.4)]",
      toggleIcon: "dark:text-emerald-400",
      mode: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:shadow-[0_0_12px_rgba(16,185,129,0.15)]",
      modeDot: "bg-emerald-500 dark:shadow-[0_0_8px_rgba(16,185,129,0.9)]",
      modeText: "text-emerald-700 dark:text-emerald-200",
      active: "bg-stakeholder-champion-soft text-stakeholder-champion",
      activeBar: "bg-stakeholder-champion",
      userCard: "bg-card-1 dark:bg-card-1/60",
      userAvatar: "",
      divider: "",
      metaText: "dark:text-white",
    },
  },
  SPONSOR: {
    buttonVariant: "sponsor",
    dashboardName: "Dashboard Sponsor",
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
      { name: "Pengumuman", url: "/sponsor/announcement", icon: Megaphone },
    ],
    classes: {
      sidebar:
        "dark:border-blue-500/20 dark:shadow-[2px_0_24px_rgba(0,53,157,0.08)]",
      toggle:
        "dark:border-blue-500/40 dark:bg-black dark:shadow-[0_0_8px_rgba(0,53,157,0.4)]",
      toggleIcon: "dark:text-gray-300",
      mode: "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:shadow-[0_0_12px_rgba(0,53,157,0.12)]",
      modeDot: "bg-blue-600 dark:shadow-[0_0_8px_rgba(59,130,246,0.7)]",
      modeText: "text-blue-700 dark:text-blue-200",
      active: "bg-stakeholder-sponsor-soft text-stakeholder-sponsor",
      activeBar: "bg-stakeholder-sponsor",
      userCard: "bg-card-1 dark:bg-card-1/60",
      userAvatar: "",
      divider: "",
      metaText: "dark:text-white",
    },
  },
};

export default function SidebarAILN({
  sessionToken,
  variant,
}: {
  sessionToken: string;
  variant: SidebarAILNVariant;
}) {
  const config = VARIANT_CONFIG[variant];
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const isDark = mounted && resolvedTheme === "dark";
  const logoUrl = isCollapsed
    ? isDark
      ? HUTAMA_KARYA_LOGO_SQUARE_DARK
      : HUTAMA_KARYA_LOGO_SQUARE
    : isDark
      ? HUTAMA_KARYA_LOGO_DARK
      : HUTAMA_KARYA_LOGO;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const res = await DeleteSession();
      if (res.code === "NO_CONTENT") {
        // Login lives in a separate repo; LOGIN_URL is external so this is a
        // full-page navigation.
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

  const userQ = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const memberQ = trpc.auth.checkAilMember.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const user = userQ.data?.user;
  const member = memberQ.data?.ail_member;
  const championedGroups = member?.championed_groups ?? [];
  const groupName =
    variant === "CHAMPION"
      ? championedGroups.length > 0
        ? championedGroups.map((g) => g.name).join(", ")
        : "-"
      : (member?.group?.name ?? "-");

  return (
    <div
      className={`fixed left-0 z-50 hidden h-full w-full bg-white dark:bg-black dark:border-r lg:flex lg:flex-col ${
        isCollapsed ? "max-w-16" : "max-w-64"
      } ${config.classes.sidebar}`}
      style={{ borderRight: "1px solid var(--dashboard-border)" }}
    >
      <div
        className={`relative flex h-full w-full flex-col ${
          isCollapsed ? "px-2 py-4" : "p-4"
        }`}
      >
        <button
          onClick={toggleSidebar}
          className={`absolute -right-4 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-sm ${config.classes.toggle}`}
        >
          <ChevronLeft
            className={`h-3 w-3 text-gray-500 transition-transform ${
              config.classes.toggleIcon
            } ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        <div className="mb-6 flex items-center justify-center">
          <Image
            src={logoUrl}
            alt="Hutama Karya"
            width={400}
            height={400}
            className={
              isCollapsed ? "h-10 w-10 object-contain" : "h-auto w-full"
            }
          />
        </div>

        <div
          className={`mb-4 flex items-center rounded-md border ${
            config.classes.mode
          } ${isCollapsed ? "justify-center p-2" : "gap-2 px-3 py-2"}`}
        >
          <span
            className={`size-2 shrink-0 rounded-full ${config.classes.modeDot}`}
          />
          {!isCollapsed && (
            <span
              className={`text-xs font-semibold ${config.classes.modeText}`}
            >
              {config.dashboardName}
            </span>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {config.menu.map((item) => {
            const active = item.exact
              ? pathname === item.url
              : pathname.startsWith(item.url);
            const Icon = item.icon;

            return (
              <Link
                key={item.url}
                href={item.url}
                className={`relative flex items-center gap-3 rounded-md p-2 text-sm transition ${
                  active ? config.classes.active : INACTIVE_CLASSES
                } ${isCollapsed ? "justify-center" : "pl-3.5"}`}
              >
                {active && !isCollapsed && (
                  <span
                    className={`absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full ${config.classes.activeBar}`}
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}

          {variant === "STUDENT" && (
            <>
              <div
                className={`my-1 border-t border-dashboard-border ${config.classes.divider}`}
              />
              <Link
                href="/student/skill-practice/create"
                title="Catat Use Case"
                className={`flex items-center gap-3 rounded-md p-2 text-sm font-medium text-stakeholder-student-foreground transition hover:bg-red-50 dark:hover:bg-red-500/10 ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <PlusCircle className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Catat Use Case</span>}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-3 shrink-0">
          {!isCollapsed ? (
            <div
              className={`rounded-lg border border-dashboard-border p-3 ${config.classes.userCard}`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={user?.avatar || DEFAULT_AVATAR}
                  alt={user?.full_name ?? ""}
                  width={36}
                  height={36}
                  className={`h-9 w-9 rounded-full object-cover dark:ring-1 ${config.classes.userAvatar}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold dark:text-white">
                    {user?.full_name ?? "..."}
                  </div>
                  <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {member?.job_title ?? ""}
                  </div>
                </div>
              </div>

              <div
                className={`mt-2 border-t border-dashboard-border pt-2 ${config.classes.divider}`}
              >
                <IdentityMeta
                  variant={variant}
                  groupName={groupName}
                  metaTextClassName={config.classes.metaText}
                />
              </div>

              <RoleSwitch variant={variant} memberRole={member?.role} />

              <ButtonAILN
                variant={config.buttonVariant}
                size="small"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={
                  variant === "SPONSOR" ? "mt-3 w-full" : "mt-2 w-full"
                }
              >
                <LogOut className="size-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </ButtonAILN>
            </div>
          ) : (
            <Image
              src={user?.avatar || DEFAULT_AVATAR}
              alt={user?.full_name ?? ""}
              width={36}
              height={36}
              className={`mx-auto h-9 w-9 rounded-full object-cover dark:ring-1 ${config.classes.userAvatar}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function IdentityMeta({
  variant,
  groupName,
  metaTextClassName,
}: {
  variant: SidebarAILNVariant;
  groupName: string;
  metaTextClassName: string;
}) {
  if (variant === "SPONSOR") {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs tracking-wide text-gray-500 dark:text-gray-400">
          Hutama Karya
        </span>
        <ThemeSwitcherAILN />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Group
          </div>
          <div
            className={`truncate text-xs font-medium text-gray-700 ${metaTextClassName}`}
          >
            {groupName}
          </div>
        </div>
        <ThemeSwitcherAILN />
      </div>
    </>
  );
}

function RoleSwitch({
  variant,
  memberRole,
}: {
  variant: SidebarAILNVariant;
  memberRole?: string;
}) {
  if (variant === "STUDENT" && memberRole === "CHAMPION") {
    return (
      <Link href="/champion" className="mt-2 block">
        <ButtonAILN variant="neutral" size="small" className="w-full">
          <UserRoundKey className="size-4" />
          Mode Champion
        </ButtonAILN>
      </Link>
    );
  }

  if (variant === "CHAMPION") {
    return (
      <Link href="/student" className="mt-2 block">
        <ButtonAILN variant="neutral" size="small" className="w-full">
          <UserRound className="size-4" />
          Mode Student
        </ButtonAILN>
      </Link>
    );
  }

  return null;
}
