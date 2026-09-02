"use client";
import type { LmsProjectAccess } from "@/apis/auth";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Same project-logo fallback used in SidebarAILN.
const DEFAULT_PROJECT_LOGO =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-white-square.webp";

// Diagonal stripe texture over the banner gradient.
const STRIPE_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, transparent 1px, transparent 10px)",
};

// Stable mock derived from the project id — no real progress endpoint here.
function mockProgressPercent(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 101;
}

export default function ProjectJumpBackInCardAILN({
  project,
}: {
  project: LmsProjectAccess;
}) {
  const percent = mockProgressPercent(project.id);

  return (
    <Link
      href={`/${project.id}/${project.role}`}
      className="group overflow-hidden rounded-xl border border-dashboard-border bg-card-1 transition-shadow hover:shadow-md"
    >
      <div className="relative h-16 overflow-hidden bg-linear-to-br from-forest-deep via-forest-deep to-claude">
        <div className="absolute inset-0" style={STRIPE_STYLE} />
      </div>
      <div className="px-4 pb-4">
        <div className="-mt-6 mb-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-4 border-card-1 bg-white shadow-sm">
            <Image
              src={project.avatar || DEFAULT_PROJECT_LOGO}
              alt={project.name}
              fill
              unoptimized
              className="object-cover p-1.5"
            />
          </div>
        </div>
        <p className="truncate text-sm font-bold text-foreground">
          {project.name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-dashboard-border bg-dashboard-bg px-2.5 py-0.5 text-xs font-medium capitalize text-foreground">
            {project.role}
          </span>
          {project.group_name && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} />
              {project.group_name}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-dashboard-border">
            <div
              className="h-1.5 rounded-full bg-claude"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {percent}%
          </span>
        </div>
      </div>
    </Link>
  );
}
