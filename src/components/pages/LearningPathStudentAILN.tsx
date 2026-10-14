"use client";

import type { StudentChapter, StudentLevel } from "@/apis/learnings";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import {
  formatChapterDuration,
  formatChapterSessionDate,
} from "@/lib/date-time-manipulation";
import { formatInt } from "@/lib/format";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  BrainCircuit,
  CalendarDays,
  Check,
  Clock3,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  MapPin,
  Monitor,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const cardStyles = [
  { surface: "bg-[#fbe5ee] dark:bg-[#3d2532]", icon: BrainCircuit },
  { surface: "bg-[#e3f3f8] dark:bg-[#213640]", icon: Bot },
  { surface: "bg-[#faf6d5] dark:bg-[#3b3824]", icon: Lightbulb },
  { surface: "bg-[#ddf5e7] dark:bg-[#213c30]", icon: Sparkles },
];

function ChapterCard({
  chapter,
  chapterNumber,
  currentLevelNumber,
  projectId,
}: {
  chapter: StudentChapter;
  chapterNumber: number;
  currentLevelNumber: number;
  projectId: string;
}) {
  const locked = chapter.level.level_number > currentLevelNumber;
  const completed = chapter.progress === "completed";
  const palette = cardStyles[(chapterNumber - 1) % cardStyles.length];
  const Illustration = palette.icon;
  const status = locked
    ? "Terkunci"
    : completed
      ? "Konten selesai"
      : chapter.progress === "in_progress"
        ? "Sedang berjalan"
        : "Belum dimulai";
  const action = locked
    ? "Lihat jadwal"
    : completed
      ? "Buka kembali"
      : chapter.progress === "in_progress"
        ? "Lanjutkan"
        : "Mulai chapter";

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-dashboard-border bg-card-1 transition-shadow hover:shadow-lg hover:shadow-forest-deep/5">
      <div className={`relative flex min-h-[310px] flex-1 flex-col overflow-hidden p-5 sm:p-6 ${palette.surface}`}>
        <div className="pointer-events-none absolute -right-9 -top-10 h-44 w-44 rounded-full border border-black/5 bg-white/20 dark:border-white/10 dark:bg-white/5" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-white/10 dark:text-white">
            Level {chapter.level.level_number} · Chapter {String(chapterNumber).padStart(2, "0")}
          </span>
          <span className="rounded-full bg-white/65 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-white/10 dark:text-white">
            {status}
          </span>
        </div>

        <div className="pointer-events-none absolute right-5 top-[4.5rem] flex h-24 w-24 rotate-[-9deg] items-center justify-center rounded-lg border border-white/80 bg-white/55 text-forest-deep shadow-[0_16px_28px_rgba(6,35,25,0.12)] dark:border-white/15 dark:bg-white/10 dark:text-lime-bright sm:right-7 sm:h-28 sm:w-28">
          <Illustration className="h-12 w-12 rotate-[9deg] stroke-[1.4] sm:h-14 sm:w-14" aria-hidden="true" />
        </div>

        <div className="relative z-10 mt-9 max-w-[calc(100%-6rem)] sm:max-w-[calc(100%-7rem)]">
          <h2 className="font-headline text-xl font-medium leading-tight text-gray-950 dark:text-white sm:text-2xl">
            {chapter.name}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-5 text-gray-600 dark:text-gray-300">
            {chapter.description || "Pelajari materi dan selesaikan tugas di chapter ini."}
          </p>
        </div>

        <div className="relative z-10 mt-auto grid gap-x-4 gap-y-2 pt-6 text-xs text-gray-700 dark:text-gray-200 sm:grid-cols-2">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
            {formatChapterSessionDate(chapter.session_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {formatChapterDuration(chapter.duration_minutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Monitor className="h-4 w-4 shrink-0" aria-hidden="true" />
            {chapter.method === "online" ? "Online" : "Tatap muka"}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{chapter.location_name?.trim() || "Lokasi belum tersedia"}</span>
          </span>
        </div>

        <div className="relative z-10 mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-700 dark:text-gray-200">
            <span>Progres konten utama</span>
            <span className="font-medium">
              {chapter.done_tasks}/{chapter.total_tasks}
            </span>
          </div>
          <progress
            value={chapter.done_tasks}
            max={chapter.total_tasks || 1}
            aria-label={`Progres ${chapter.name}`}
            className="h-2 w-full overflow-hidden rounded-full accent-forest-deep [&::-webkit-progress-bar]:bg-black/10 [&::-webkit-progress-value]:bg-forest-deep dark:[&::-webkit-progress-value]:bg-lime-bright [&::-moz-progress-bar]:bg-forest-deep dark:[&::-moz-progress-bar]:bg-lime-bright"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {locked ? <LockKeyhole className="h-4 w-4" /> : completed ? <Check className="h-4 w-4 text-claude" /> : <ListChecks className="h-4 w-4" />}
          {locked ? "Lihat detail sesi" : `${chapter.done_tasks} dari ${chapter.total_tasks} selesai`}
        </span>
        <Link
          href={`/${projectId}/student/learning-path/${chapter.id}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-claude dark:bg-white dark:text-gray-950 dark:hover:bg-lime-bright"
        >
          {action}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function LearningPathStudentAILN({
  levels,
  chapters,
  currentLevelNumber,
  totalXp,
  projectId,
}: {
  levels: StudentLevel[];
  chapters: StudentChapter[];
  currentLevelNumber: number;
  totalXp: number;
  projectId: string;
}) {
  const [levelFilter, setLevelFilter] = useState<number | "all">("all");
  const visibleChapters =
    levelFilter === "all"
      ? chapters
      : chapters.filter((chapter) => chapter.level.level_number === levelFilter);

  return (
    <PageContainerAILN>
      <div className="flex w-full min-w-0 flex-col gap-6 pb-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-widest text-claude uppercase dark:text-lime-bright">
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Perjalanan belajarmu
            </div>
            <h1 className="font-headline text-3xl font-medium text-gray-950 dark:text-white sm:text-4xl">
              Alur Belajar
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Pilih chapter untuk melihat langkah belajar dan videonya.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-dashboard-border bg-card-1 px-3 py-2 text-gray-700 dark:text-gray-200">
              Level aktif <strong className="ml-1 font-medium">{currentLevelNumber}</strong>
            </span>
            <span className="rounded-full border border-dashboard-border bg-card-1 px-3 py-2 text-gray-700 dark:text-gray-200">
              XP <strong className="ml-1 font-medium">{formatInt(totalXp)}</strong>
            </span>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter level">
          <button
            type="button"
            aria-pressed={levelFilter === "all"}
            onClick={() => setLevelFilter("all")}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${levelFilter === "all" ? "bg-forest-deep text-white" : "border border-dashboard-border bg-card-1 text-gray-600 hover:bg-card-2 dark:text-gray-300"}`}
          >
            Semua chapter
          </button>
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              aria-pressed={levelFilter === level.level_number}
              onClick={() => setLevelFilter(level.level_number)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${levelFilter === level.level_number ? "bg-forest-deep text-white" : "border border-dashboard-border bg-card-1 text-gray-600 hover:bg-card-2 dark:text-gray-300"}`}
            >
              Level {level.level_number} · {level.name}
            </button>
          ))}
        </div>

        {visibleChapters.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {visibleChapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                chapterNumber={chapters.findIndex((item) => item.id === chapter.id) + 1}
                currentLevelNumber={currentLevelNumber}
                projectId={projectId}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashboard-border bg-card-1 px-6 py-12 text-center text-sm text-gray-500">
            Belum ada chapter di level ini.
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-lg border border-dashboard-border bg-card-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="text-xs font-medium tracking-widest text-claude uppercase dark:text-lime-bright">
              Latihan di luar chapter
            </div>
            <h2 className="mt-1 font-headline text-lg font-medium text-gray-900 dark:text-white">
              Terapkan skill lewat prompt &amp; use case
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Latihan dari Champion tersedia di halaman Latihan Skill.
            </p>
          </div>
          <Link
            href={`/${projectId}/student/skill-practice`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-dashboard-border px-4 py-2 text-sm font-medium text-gray-900 hover:bg-card-2 dark:text-white"
          >
            Buka Latihan Skill
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </PageContainerAILN>
  );
}
