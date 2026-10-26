import type { ChapterDetail } from "@/apis/chapters";
import AppTopography from "@/components/elements/AppTopography";
import {
  formatChapterDuration,
  formatChapterSessionDate,
} from "@/lib/date-time-manipulation";
import { httpHref } from "@/lib/utils";
import {
  Building2,
  CalendarDays,
  Clock3,
  ExternalLink,
  LockKeyhole,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const PROGRESS_LABEL: Record<ChapterDetail["progress"], string> = {
  not_started: "Belum dimulai",
  in_progress: "Sedang berjalan",
  completed: "Selesai",
};

function HeroCard({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-white/10 bg-sevenpreneur-coal/75 p-3.5 backdrop-blur-sm">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
          {label}
        </p>
        <div className="mt-1 text-sm leading-5 text-white">{children}</div>
      </div>
    </div>
  );
}

export default function ChapterHeroAILN({
  chapter,
  unlocked,
}: {
  chapter: ChapterDetail;
  unlocked: boolean;
}) {
  const location = httpHref(chapter.location_url);
  const logo = httpHref(chapter.company_image_url);
  const owner = chapter.company_name?.trim() || chapter.project_name;

  return (
    <header className="relative isolate overflow-hidden rounded-lg border border-sevenpreneur-coal bg-sevenpreneur-coal text-white dark:border-white/10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <AppTopography
          color="#ffffff"
          lineCount={24}
          glow={0.35}
          fog={0.45}
          brightness={0.8}
          speed={0.2}
          tilt={30}
          dpr={1.5}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-sevenpreneur-coal/45"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-sevenpreneur-coal/90 via-sevenpreneur-coal/60 to-sevenpreneur-coal/20"
      />

      <div className="grid gap-5 px-6 py-5 sm:px-8 sm:py-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end lg:gap-8 lg:px-10">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              {logo ? (
                <Image
                  src={logo}
                  alt={`Logo ${owner}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <Building2
                  className="size-5 text-sevenpreneur-coal"
                  aria-hidden
                />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{owner}</p>
              {chapter.company_name?.trim() && (
                <p className="truncate text-xs text-white/60">
                  {chapter.project_name}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-sevenpreneur-coal">
              Level {chapter.level_number} · {chapter.level_name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-2.5 py-1 text-xs font-medium text-white/85">
              {unlocked ? (
                <span
                  className={`size-1.5 rounded-full ${chapter.progress === "completed" ? "bg-white" : "bg-white/45"}`}
                />
              ) : (
                <LockKeyhole className="size-3" />
              )}
              {unlocked ? PROGRESS_LABEL[chapter.progress] : "Terkunci"}
            </span>
            <span className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-medium text-white/85">
              {chapter.method === "online" ? "Online" : "Tatap muka"}
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl font-headline text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
            {chapter.name}
          </h1>
          {chapter.description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              {chapter.description}
            </p>
          )}
          {!unlocked && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-white/80">
              <LockKeyhole className="size-3.5 shrink-0" />
              Dibuka admin saat sesi chapter dimulai.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <HeroCard icon={<CalendarDays className="size-4" />} label="Jadwal">
            <p className="font-medium">
              {formatChapterSessionDate(
                chapter.session_date,
                "dddd, D MMMM YYYY",
              )}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-white/70">
              <Clock3 className="size-3.5" />
              {formatChapterSessionDate(chapter.session_date, "HH:mm [WIB]")}
              {" · "}
              {formatChapterDuration(chapter.duration_minutes)}
            </p>
          </HeroCard>
          <HeroCard icon={<MapPin className="size-4" />} label="Lokasi">
            <p className="truncate font-medium">
              {chapter.location_name.trim() ||
                (chapter.method === "online"
                  ? "Online"
                  : "Lokasi belum tersedia")}
            </p>
            {location && (
              <a
                href={location}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/80 underline underline-offset-2 hover:text-white"
              >
                Buka lokasi
                <ExternalLink className="size-3" />
              </a>
            )}
          </HeroCard>
        </div>
      </div>
    </header>
  );
}
