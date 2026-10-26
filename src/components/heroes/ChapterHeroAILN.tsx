import type { ChapterDetail } from "@/apis/chapters";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import {
  formatChapterDuration,
  formatChapterSessionDate,
} from "@/lib/date-time-manipulation";
import { httpHref } from "@/lib/utils";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  LockKeyhole,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

export type ChapterJourneyStep = {
  key: string;
  label: string;
  done: boolean;
  href: string;
};

const PROGRESS_LABEL: Record<ChapterDetail["progress"], string> = {
  not_started: "Belum dimulai",
  in_progress: "Sedang berjalan",
  completed: "Selesai",
};

const RING_RADIUS = 42;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function InfoTile({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lime-bright">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium leading-5 text-white">
          {children}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="relative size-28">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="8"
          className="stroke-white/15"
        />
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - percent / 100)}
          className="stroke-lime-bright transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline text-2xl font-medium text-white">
          {percent}%
        </span>
        <span className="text-[11px] text-white/60">progres</span>
      </div>
    </div>
  );
}

export default function ChapterHeroAILN({
  chapter,
  unlocked,
  steps,
}: {
  chapter: ChapterDetail;
  unlocked: boolean;
  steps: ChapterJourneyStep[];
}) {
  const location = httpHref(chapter.location_url);
  const currentStep = steps.find((step) => !step.done) ?? null;
  const currentIndex = currentStep ? steps.indexOf(currentStep) : steps.length;

  return (
    <header className="relative isolate overflow-hidden rounded-lg border border-forest-deep bg-forest-deep text-white dark:border-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 right-16 -z-10 size-80 rounded-full bg-lime-bright/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-48 -z-10 size-[480px] rounded-full border border-white/10"
      >
        <div className="absolute inset-14 rounded-full border border-white/10" />
        <div className="absolute inset-28 rounded-full border border-lime-bright/20" />
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lime-bright px-2.5 py-1 text-xs font-medium text-forest-deep">
              Level {chapter.level_number} · {chapter.level_name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-xs font-medium text-white/85">
              {unlocked ? (
                <span
                  className={`size-1.5 rounded-full ${chapter.progress === "completed" ? "bg-lime-bright" : "bg-amber-300"}`}
                />
              ) : (
                <LockKeyhole className="size-3" />
              )}
              {unlocked ? PROGRESS_LABEL[chapter.progress] : "Terkunci"}
            </span>
            <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs font-medium text-white/85">
              {chapter.method === "online" ? "Online" : "Tatap muka"}
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl font-headline text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
            {chapter.name}
          </h1>
          {chapter.description && (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
              {chapter.description}
            </p>
          )}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InfoTile icon={<CalendarDays className="size-4" />} label="Jadwal">
              {formatChapterSessionDate(
                chapter.session_date,
                "dddd, D MMM YYYY",
              )}
            </InfoTile>
            <InfoTile icon={<Clock3 className="size-4" />} label="Waktu">
              {formatChapterSessionDate(chapter.session_date, "HH:mm [WIB]")}
              <span className="text-white/60">
                {" "}
                · {formatChapterDuration(chapter.duration_minutes)}
              </span>
            </InfoTile>
            <InfoTile icon={<MapPin className="size-4" />} label="Lokasi">
              <span className="block truncate">
                {chapter.location_name.trim() ||
                  (chapter.method === "online"
                    ? "Online"
                    : "Lokasi belum tersedia")}
              </span>
              {location && (
                <a
                  href={location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-xs text-lime-bright underline underline-offset-2"
                >
                  Buka lokasi
                  <ExternalLink className="size-3" />
                </a>
              )}
            </InfoTile>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-lg border border-white/10 bg-white/[0.06] p-5 text-center">
          <ProgressRing done={chapter.done_tasks} total={chapter.total_tasks} />
          <p className="text-xs text-white/70">
            {chapter.done_tasks} dari {chapter.total_tasks} video & materi
            selesai
          </p>
          {!unlocked ? (
            <p className="flex items-start gap-2 text-left text-xs leading-5 text-white/80">
              <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-lime-bright" />
              Dibuka admin saat sesi chapter dimulai.
            </p>
          ) : currentStep ? (
            <ButtonAILN asChild variant="primary" size="medium" width="full">
              <a href={currentStep.href}>
                Lanjut: {currentStep.label}
                <ArrowRight className="size-4" />
              </a>
            </ButtonAILN>
          ) : (
            steps.length > 0 && (
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-lime-bright">
                <Sparkles className="size-4" />
                Semua tahap selesai
              </p>
            )
          )}
        </div>
      </div>

      {unlocked && steps.length > 0 && (
        <nav
          aria-label="Perjalanan chapter"
          className="border-t border-white/10 px-6 py-4 sm:px-8"
        >
          <ol className="flex items-center gap-2 overflow-x-auto pb-1">
            {steps.map((step, index) => {
              const current = index === currentIndex;
              return (
                <li key={step.key} className="flex shrink-0 items-center gap-2">
                  {index > 0 && (
                    <span
                      aria-hidden
                      className={`h-px w-6 sm:w-10 ${index <= currentIndex ? "bg-lime-bright/60" : "bg-white/15"}`}
                    />
                  )}
                  <a
                    href={step.href}
                    aria-current={current ? "step" : undefined}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-lime-bright"
                  >
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${step.done ? "bg-lime-bright text-forest-deep" : current ? "border-2 border-lime-bright text-lime-bright" : "border border-white/25 text-white/60"}`}
                    >
                      {step.done ? <Check className="size-3.5" /> : index + 1}
                    </span>
                    <span className="text-left">
                      <span
                        className={`block text-sm leading-4 ${step.done || current ? "font-medium text-white" : "text-white/70"}`}
                      >
                        {step.label}
                      </span>
                      <span className="block text-[11px] leading-4 text-white/55">
                        {step.done
                          ? "Selesai"
                          : current
                            ? "Sekarang"
                            : "Berikutnya"}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </header>
  );
}
