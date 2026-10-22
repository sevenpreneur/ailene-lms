import type { LmsProjectAccess, LmsProjectRole } from "@/apis/auth";
import { ArrowRight, Building2, GraduationCap, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const roleLabels: Record<LmsProjectRole, string> = {
  student: "Student",
  champion: "Champion",
  sponsor: "Sponsor",
};

export default function ProjectJumpBackInCardAILN({
  project,
  featured = false,
}: {
  project: LmsProjectAccess;
  featured?: boolean;
}) {
  const needsAssessment =
    project.role === "student" && !project.has_pre_assessment;
  const href = needsAssessment
    ? `/${project.id}/student/pre-assessment`
    : `/${project.id}/${project.role}`;
  const description =
    "Transformasikan cara kerjamu dengan AI untuk menyelesaikan pekerjaan lebih efisien dan menghasilkan dampak yang lebih besar.";

  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-sevenpreneur-coal text-white transition-colors hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
    >
      {featured && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-36 size-[420px] rounded-full border border-white/10"
        >
          <div className="absolute inset-12 rounded-full border border-white/10" />
          <div className="absolute inset-24 rounded-full border border-white/10" />
        </div>
      )}
      <div
        className={`relative flex flex-1 flex-col ${featured ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ${featured ? "size-14" : "size-11"}`}
          >
            {project.avatar ? (
              <Image
                src={project.avatar}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <Building2 className="size-6 text-gray-700" aria-hidden="true" />
            )}
          </div>
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">
            {roleLabels[project.role]}
          </span>
        </div>
        <div className={featured ? "mt-7 flex-1" : "mt-5 flex-1"}>
          {project.company_name && (
            <p className="mb-2 text-xs font-medium text-white/70">
              {project.company_name}
            </p>
          )}
          <h3
            className={`break-words font-medium tracking-tight ${featured ? "max-w-xl text-2xl leading-tight sm:text-4xl" : "text-xl leading-snug"}`}
          >
            {project.name}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
            {description}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/70">
          {project.group_name && (
            <span className="flex min-w-0 items-start gap-2">
              <Users className="size-4 shrink-0" aria-hidden="true" />
              <span className="break-words">{project.group_name}</span>
            </span>
          )}
          {project.role === "student" && (
            <span className="flex items-center gap-2">
              <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
              {needsAssessment
                ? "Pre-assessment belum selesai"
                : "Pre-assessment selesai"}
            </span>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-5">
          <span className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-sevenpreneur-coal group-hover:bg-white/90">
            Buka LMS
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </span>
          {featured && (
            <span className="text-xs text-white/60">
              Ruang programmu, siap dibuka.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
