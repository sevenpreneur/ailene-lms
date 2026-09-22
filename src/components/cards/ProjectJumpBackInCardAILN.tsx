"use client";
import type { LmsProjectAccess } from "@/apis/auth";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Same project-logo fallback used in SidebarAILN.
const DEFAULT_PROJECT_LOGO =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-white-square.webp";

export default function ProjectJumpBackInCardAILN({
  project,
}: {
  project: LmsProjectAccess;
}) {
  return (
    <Link
      href={`/${project.id}/${project.role}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-dashboard-border bg-card-1 transition-all hover:-translate-y-0.5 hover:border-claude/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-claude"
    >
      <div className="flex items-start gap-4 p-5">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-dashboard-border bg-white">
          <Image
            src={project.avatar || DEFAULT_PROJECT_LOGO}
            alt=""
            fill
            unoptimized
            className="object-contain p-1.5"
          />
        </div>

        <div className="min-w-0 flex-1">
          {project.company_name && (
            <p className="truncate text-xs font-medium text-muted-foreground">
              {project.company_name}
            </p>
          )}
          <p className="truncate text-base font-bold leading-snug text-foreground">
            {project.name}
          </p>
        </div>

        <ArrowRight
          size={18}
          className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-claude"
        />
      </div>

      <div className="mt-auto border-t border-dashboard-border/70 px-5 py-3 text-xs">
        <span className="text-muted-foreground">Dept Name: </span>
        <span className="font-medium text-foreground">{project.group_name}</span>
      </div>
    </Link>
  );
}
