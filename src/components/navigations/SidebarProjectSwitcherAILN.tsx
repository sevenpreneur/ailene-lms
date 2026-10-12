"use client";

import type { LmsProjectAccess, LmsProjectRole } from "@/apis/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  ChevronsUpDown,
  LayoutGrid,
  UserRound,
  UserRoundKey,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// White logos are for dark mode; the regular ones sit on the light surface.
const HUTAMA_KARYA_LOGO_SQUARE_ON_DARK =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-white-square.webp";
const HUTAMA_KARYA_LOGO_SQUARE_ON_LIGHT =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-square.webp";

export const ROLE_LABEL: Record<LmsProjectRole, string> = {
  student: "Student",
  champion: "Champion",
  sponsor: "Sponsor",
};

// The program row on top of the rail: identity, the champion's view switch, and the other programs.
export default function SidebarProjectSwitcherAILN({
  project,
  projects,
  view,
  collapsed,
}: {
  project: LmsProjectAccess | undefined;
  projects: LmsProjectAccess[];
  view: LmsProjectRole;
  collapsed: boolean;
}) {
  const name = project?.name ?? "Project";
  const subtitle =
    view === "sponsor" || !project?.group_name
      ? ROLE_LABEL[view]
      : `${ROLE_LABEL[view]} · ${project.group_name}`;

  // Only a champion has two views of the same program.
  const viewSwitch =
    project?.role === "champion"
      ? view === "champion"
        ? { href: `/${project.id}/student`, label: "Mode Student", icon: UserRound }
        : { href: `/${project.id}/champion`, label: "Mode Champion", icon: UserRoundKey }
      : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={collapsed ? name : undefined}
        className={`flex items-center rounded-lg text-left outline-none transition-colors hover:bg-sb-item-hover focus-visible:bg-sb-item-hover data-[state=open]:bg-sb-item-hover ${
          collapsed ? "p-1" : "w-full gap-2.5 p-1.5"
        }`}
      >
        <ProjectLogo project={project} />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-sb-text-strong">
                {name}
              </span>
              <span className="block truncate text-xs text-sb-text">
                {subtitle}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-sb-text" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={collapsed ? "right" : "bottom"}
        align="start"
        className={collapsed ? "" : "w-[var(--radix-dropdown-menu-trigger-width)]"}
      >
        {viewSwitch && (
          <>
            <DropdownMenuItem asChild>
              <Link href={viewSwitch.href}>
                <viewSwitch.icon className="text-muted-foreground" />
                {viewSwitch.label}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel>Program</DropdownMenuLabel>
        {projects.map((p) => (
          <DropdownMenuItem key={p.id} asChild>
            <Link href={`/${p.id}/${p.role}`}>
              <ProjectLogo project={p} small />
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              {p.id === project?.id && (
                <Check className="text-sb-item-active-text" />
              )}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <LayoutGrid className="text-muted-foreground" />
            Semua program
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectLogo({
  project,
  small,
}: {
  project: LmsProjectAccess | undefined;
  small?: boolean;
}) {
  const size = small ? "size-5" : "size-8";
  const frame = `relative ${size} shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-sb-border dark:bg-white/5`;
  const alt = project?.name ?? "Project";

  if (project?.avatar) {
    return (
      <span className={frame}>
        <Image src={project.avatar} alt={alt} fill unoptimized className="object-cover" />
      </span>
    );
  }
  return (
    <span className={frame}>
      <Image
        src={HUTAMA_KARYA_LOGO_SQUARE_ON_LIGHT}
        alt={alt}
        fill
        unoptimized
        className="object-cover dark:hidden"
      />
      <Image
        src={HUTAMA_KARYA_LOGO_SQUARE_ON_DARK}
        alt={alt}
        fill
        unoptimized
        className="hidden object-cover dark:block"
      />
    </span>
  );
}
