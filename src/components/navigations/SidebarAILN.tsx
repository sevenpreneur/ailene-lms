"use client";

import type { LmsProjectRole, LmsSession } from "@/apis/auth";
import SidebarNavItemAILN from "@/components/navigations/SidebarNavItemAILN";
import SidebarProjectSwitcherAILN, {
  ROLE_LABEL,
} from "@/components/navigations/SidebarProjectSwitcherAILN";
import SidebarShellAILN, {
  SidebarGroupLabelAILN,
} from "@/components/navigations/SidebarShellAILN";
import SidebarUserMenuAILN from "@/components/navigations/SidebarUserMenuAILN";
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
  Target,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

export type SidebarAILNVariant = "STUDENT" | "CHAMPION" | "SPONSOR";

type MenuItem = {
  name: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
};

const VARIANT_CONFIG: Record<
  SidebarAILNVariant,
  { view: LmsProjectRole; groupLabel: string; menu: MenuItem[] }
> = {
  STUDENT: {
    view: "student",
    groupLabel: "Belajar",
    menu: [
      { name: "Hari Ini", url: "/student", icon: CalendarDays, exact: true },
      { name: "Pre Assessment", url: "/student/pre-assessment", icon: Gauge },
      {
        name: "Alur Belajar",
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
    view: "champion",
    groupLabel: "Tim",
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
    view: "sponsor",
    groupLabel: "Organisasi",
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
      { name: "Workforce", url: "/sponsor/workforce", icon: BarChart3 },
      { name: "ROI Productivity", url: "/sponsor/roi", icon: Target },
    ],
  },
};

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
  const pathname = usePathname();
  const project = session.project_access.find((p) => p.id === projectId);

  const switcher = (collapsed: boolean) => (
    <SidebarProjectSwitcherAILN
      project={project}
      projects={session.project_access}
      view={config.view}
      collapsed={collapsed}
    />
  );

  return (
    <SidebarShellAILN
      mobileBrand={
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-sb-text-strong">
            {project?.name ?? "Project"}
          </div>
          <div className="truncate text-xs text-sb-text">
            {ROLE_LABEL[config.view]}
          </div>
        </div>
      }
      header={switcher}
      nav={(collapsed) => (
        <>
          <SidebarGroupLabelAILN collapsed={collapsed}>
            {config.groupLabel}
          </SidebarGroupLabelAILN>
          {config.menu.map((item) => {
            const url = `/${projectId}${item.url}`;
            return (
              <SidebarNavItemAILN
                key={item.url}
                href={url}
                label={item.name}
                icon={item.icon}
                active={
                  item.exact ? pathname === url : pathname.startsWith(url)
                }
                collapsed={collapsed}
              />
            );
          })}
        </>
      )}
      footer={(collapsed) => (
        <SidebarUserMenuAILN
          user={session.user}
          subtitle={session.user.job_title}
          collapsed={collapsed}
        />
      )}
    />
  );
}
