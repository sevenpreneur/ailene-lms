"use client";

import type {
  ChapterLearnings,
  LearningVideo,
  MaterialDetail,
  StudentChapter,
} from "@/apis/learnings";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import ChapterSurveyModalAILN from "@/components/modals/ChapterSurveyModalAILN";
import styles from "@/components/css/MaterialDetails.module.css";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import { isPdfUrl, renderMaterialArticle } from "@/lib/material-content";
import {
  CHAPTER_SURVEY_RATING_KEYS,
  CHAPTER_SURVEY_TEXT_KEYS,
  CHAPTER_TEST_LOCKED_MESSAGE,
} from "@/lib/chapter-evaluation";
import {
  formatChapterDuration,
  formatChapterSessionDate,
  getDurationFromSeconds,
} from "@/lib/date-time-manipulation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileText,
  ListChecks,
  ListVideo,
  LockKeyhole,
  MapPin,
  MessageSquareHeart,
  MonitorPlay,
  RotateCcw,
  SquareCheckBig,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

function youtubeEmbedUrl(raw: string): string | null {
  if (!raw || raw === "#") return null;
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtu.be",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      const id = host.includes("youtu.be")
        ? path.split("/")[1]
        : url.searchParams.get("v") ||
          path.split("/").filter(Boolean).slice(-1)[0];
      if (id && /^[\w-]{11}$/.test(id))
        return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

const YOUTUBE_EMBED_ORIGIN = "https://www.youtube-nocookie.com";

function httpHref(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatMinute(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function PanelHeading({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-dashboard-border px-5 py-4 sm:px-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashboard-border bg-card-2 text-gray-600 dark:text-gray-300">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-headline text-lg font-medium text-gray-950 dark:text-white">
          {title}
        </h2>
        {detail && (
          <p className="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

type EvaluationKind = "pre" | "quiz" | "post";

const EVALUATION_KIND: Record<
  EvaluationKind,
  { icon: ReactNode; tile: string }
> = {
  pre: {
    icon: <ClipboardList className="size-[18px]" />,
    tile: "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright",
  },
  quiz: {
    icon: <Zap className="size-[18px]" />,
    tile: "bg-lime-bright text-forest-deep",
  },
  post: {
    icon: <ClipboardCheck className="size-[18px]" />,
    tile: "bg-forest-deep text-lime-bright dark:bg-lime-bright/15",
  },
};

function EvaluationChip({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashboard-border bg-card-2 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
      {icon}
      {children}
    </span>
  );
}

function EvaluationCard({
  kind,
  step,
  isLast,
  isNext,
  label,
  title,
  description,
  questionCount,
  xp,
  score,
  done,
  lockedReason,
  actionLabel,
  href,
  onAction,
}: {
  kind: EvaluationKind;
  step: number;
  isLast: boolean;
  isNext: boolean;
  label: string;
  title: string;
  description?: string | null;
  questionCount: number;
  xp?: number;
  score?: number | null;
  done: boolean;
  lockedReason?: string | null;
  actionLabel: string;
  href?: string;
  onAction?: () => void;
}) {
  const kindStyle = EVALUATION_KIND[kind];
  const locked = !!lockedReason;
  const buttonVariant = done ? "outline" : isNext ? "forest" : "neutral";
  const buttonContent = (
    <>
      {actionLabel}
      <ArrowRight className="size-3.5" />
    </>
  );

  return (
    <li className="relative flex gap-3">
      {!isLast && (
        <span
          aria-hidden
          className={`absolute bottom-[-12px] left-[13px] top-8 w-0.5 ${done ? "bg-claude/50" : "bg-dashboard-border"}`}
        />
      )}
      <span
        className={`relative z-10 mt-4 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${done ? "bg-claude text-white" : locked ? "border border-dashboard-border bg-card-1 text-gray-400" : isNext ? "bg-forest-deep text-lime-bright ring-4 ring-claude/15 dark:bg-lime-bright dark:text-forest-deep" : "border border-claude/40 bg-card-1 text-claude dark:text-lime-bright"}`}
      >
        {done ? (
          <Check className="size-3.5" />
        ) : locked ? (
          <LockKeyhole className="size-3" />
        ) : (
          step
        )}
      </span>
      <div
        className={`min-w-0 flex-1 overflow-hidden rounded-lg border bg-card-1 transition-shadow ${locked ? "border-dashboard-border" : isNext ? "border-claude/60 shadow-[0_8px_24px_-12px_rgba(26,122,82,0.45)]" : done ? "border-claude/30" : "border-dashboard-border"}`}
      >
        <div className={`p-4 ${locked ? "opacity-70" : ""}`}>
          <div className="flex items-start gap-3">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${locked ? "bg-card-2 text-gray-400" : kindStyle.tile}`}
            >
              {kindStyle.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <p className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                  {label}
                </p>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${done ? "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright" : locked ? "bg-card-2 text-gray-500 dark:text-gray-400" : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"}`}
                >
                  {!done && !locked && (
                    <span className="size-1.5 rounded-full bg-amber-500" />
                  )}
                  {done ? "Selesai" : locked ? "Terkunci" : "Siap dikerjakan"}
                </span>
              </div>
              <h3 className="mt-0.5 font-headline text-[15px] font-medium leading-snug text-gray-950 dark:text-white">
                {title}
              </h3>
            </div>
          </div>
          {description && (
            <p className="mt-2.5 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <EvaluationChip icon={<ListChecks className="size-3" />}>
              {questionCount} soal
            </EvaluationChip>
            {xp !== undefined && (
              <EvaluationChip
                icon={<Star className="size-3 fill-amber-400 text-amber-400" />}
              >
                {xp} XP
              </EvaluationChip>
            )}
            {done && score !== null && score !== undefined && (
              <EvaluationChip
                icon={
                  <Trophy className="size-3 text-claude dark:text-lime-bright" />
                }
              >
                Skor {score}%
              </EvaluationChip>
            )}
          </div>
        </div>
        <div
          className={`border-t px-4 py-3 ${locked ? "border-amber-200/70 bg-amber-50/70 dark:border-amber-400/15 dark:bg-amber-400/5" : "border-dashboard-border bg-card-2/60"}`}
        >
          {locked ? (
            <p className="flex items-start gap-2 text-xs leading-5 text-amber-800 dark:text-amber-300">
              <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
              {lockedReason}
            </p>
          ) : href ? (
            <ButtonAILN
              asChild
              variant={buttonVariant}
              size="small"
              width="full"
            >
              <Link href={href}>{buttonContent}</Link>
            </ButtonAILN>
          ) : onAction ? (
            <ButtonAILN
              variant={buttonVariant}
              size="small"
              width="full"
              onClick={onAction}
            >
              {buttonContent}
            </ButtonAILN>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function ChapterDetailsAILN({
  chapter,
  learnings,
  materialDetails = {},
  unlocked,
  projectId,
  nextChapter,
  initialSurveyOpen = false,
}: {
  chapter: StudentChapter;
  learnings: ChapterLearnings | null;
  materialDetails?: Record<string, MaterialDetail>;
  unlocked: boolean;
  projectId: string;
  nextChapter: StudentChapter | null;
  initialSurveyOpen?: boolean;
}) {
  const router = useRouter();
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const activeVideo =
    learnings?.videos.find((video) => video.id === activeVideoId) ??
    learnings?.videos[0] ??
    null;
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<number>>(
    new Set(),
  );
  const [savingVideoId, setSavingVideoId] = useState<number | null>(null);
  const [completedMaterialIds, setCompletedMaterialIds] = useState<Set<string>>(
    new Set(),
  );
  const [savingMaterialId, setSavingMaterialId] = useState<string | null>(null);
  const renderedMaterials = useMemo(
    () =>
      Object.fromEntries(
        Object.values(materialDetails).map((detail) => [
          detail.id,
          detail.content ? renderMaterialArticle(detail.content).html : "",
        ]),
      ),
    [materialDetails],
  );
  const [quizToStart, setQuizToStart] = useState<string | null>(null);
  const [isSurveyOpen, setIsSurveyOpen] = useState(initialSurveyOpen);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const preTest = learnings?.pre_test ?? null;
  const postTest = learnings?.post_test ?? null;
  const survey = learnings?.survey ?? null;
  const contentUnlocked = unlocked && (!preTest || preTest.submitted);
  const videoVisible = contentUnlocked || !!activeVideo?.completed;
  const base = `/${projectId}/student`;
  const allMaterialsRead =
    learnings?.materials.every((material) => material.completed) ?? false;
  const evaluations: (Omit<
    Parameters<typeof EvaluationCard>[0],
    "step" | "isLast" | "isNext"
  > & { key: string })[] = [];
  if (preTest) {
    evaluations.push({
      key: "pre",
      kind: "pre",
      label: "Pre-test",
      title: preTest.name,
      description: preTest.description,
      questionCount: preTest.question_count,
      score: preTest.score,
      done: preTest.submitted,
      lockedReason:
        !preTest.available && !preTest.submitted
          ? preTest.locked_reason
            ? CHAPTER_TEST_LOCKED_MESSAGE[preTest.locked_reason]
            : "Belum tersedia"
          : null,
      actionLabel: preTest.submitted ? "Lihat hasil" : "Mulai pre-test",
      href: `${base}/chapter-tests/${preTest.id}`,
    });
  }
  learnings?.quizzes.forEach((quiz) => {
    const untouched = quiz.attempts === 0 && !quiz.active_attempt_started_at;
    evaluations.push({
      key: `quiz-${quiz.id}`,
      kind: "quiz",
      label: "Quiz",
      title: quiz.name,
      description: quiz.description,
      questionCount: quiz.question_count,
      xp: quiz.xp_reward,
      score: quiz.best_score,
      done: quiz.attempts > 0,
      lockedReason:
        untouched && !contentUnlocked
          ? "Kerjakan pre-test chapter ini dulu"
          : untouched && !allMaterialsRead
            ? "Baca semua materi terlebih dahulu"
            : null,
      actionLabel:
        quiz.attempts > 0
          ? "Lihat hasil"
          : quiz.active_attempt_started_at
            ? "Lanjutkan quiz"
            : "Mulai quiz",
      href: untouched ? undefined : `${base}/quizzes/${quiz.id}`,
      onAction: untouched ? () => setQuizToStart(quiz.id) : undefined,
    });
  });
  if (postTest) {
    evaluations.push({
      key: "post",
      kind: "post",
      label: "Post-test",
      title: postTest.name,
      description: postTest.description,
      questionCount: postTest.question_count,
      score: postTest.score,
      done: postTest.submitted,
      lockedReason:
        !postTest.available && !postTest.submitted
          ? postTest.locked_reason
            ? CHAPTER_TEST_LOCKED_MESSAGE[postTest.locked_reason]
            : "Belum tersedia"
          : null,
      actionLabel: postTest.submitted ? "Lihat hasil" : "Mulai post-test",
      href: `${base}/chapter-tests/${postTest.id}`,
    });
  }
  const nextEvaluationKey = evaluations.find(
    (evaluation) => !evaluation.done && !evaluation.lockedReason,
  )?.key;
  const embedUrl = youtubeEmbedUrl(activeVideo?.video_url ?? "");
  const location = httpHref(chapter.location_url);
  // Admins can save any HTTP(S) video link; non-YouTube ones open in a new tab.
  const externalVideoUrl = embedUrl
    ? null
    : httpHref(activeVideo?.video_url ?? null);
  const shortcutLimit = Math.max(0, Math.floor(chapter.duration_minutes / 5));
  const shortcuts = Array.from(
    { length: shortcutLimit + 1 },
    (_, index) => index * 300,
  );

  const videoTimestamps = activeVideo?.timestamps ?? [];
  const activeTimestampIndex = videoTimestamps.reduce(
    (found, timestamp, index) =>
      timestamp.start_seconds <= currentTime ? index : found,
    -1,
  );

  const postToPlayer = (message: object) =>
    playerRef.current?.contentWindow?.postMessage(
      JSON.stringify(message),
      YOUTUBE_EMBED_ORIGIN,
    );

  const seekVideo = (seconds: number) => {
    setCurrentTime(seconds);
    postToPlayer({ event: "command", func: "seekTo", args: [seconds, true] });
    postToPlayer({ event: "command", func: "playVideo", args: [] });
  };

  // The embed reports its playback position once told we are listening.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_EMBED_ORIGIN) return;
      if (event.source !== playerRef.current?.contentWindow) return;
      try {
        const data = JSON.parse(String(event.data));
        const time = data?.info?.currentTime;
        if (data?.event === "infoDelivery" && typeof time === "number") {
          setCurrentTime(time);
        }
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const markMaterialComplete = async (materialId: string) => {
    if (savingMaterialId !== null) return;
    setSavingMaterialId(materialId);
    try {
      const response = await fetch("/api/materials/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: materialId }),
      });
      if (!response.ok) throw new Error("Material completion failed");
      setCompletedMaterialIds((previous) => new Set(previous).add(materialId));
      toast.success("Materi ditandai selesai");
      router.refresh();
    } catch {
      toast.error("Gagal menandai materi. Coba lagi.");
    } finally {
      setSavingMaterialId(null);
    }
  };

  const markVideoComplete = async (video: LearningVideo) => {
    if (
      video.completed ||
      completedVideoIds.has(video.id) ||
      savingVideoId !== null
    )
      return;
    setSavingVideoId(video.id);
    try {
      const response = await fetch("/api/videos/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: video.id }),
      });
      if (!response.ok) throw new Error("Video completion failed");
      setCompletedVideoIds((previous) => new Set(previous).add(video.id));
      toast.success("Video ditandai selesai");
      router.refresh();
    } catch {
      toast.error("Gagal menandai video. Coba lagi.");
    } finally {
      setSavingVideoId(null);
    }
  };

  return (
    <PageContainerAILN>
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ButtonAILN
            variant="neutral"
            size="small"
            onClick={() => router.push(`${base}/learning-path`)}
          >
            <ArrowLeft className="size-4" />
            Semua chapter
          </ButtonAILN>
          <span className="rounded-lg border border-dashboard-border bg-card-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
            Level {chapter.level.level_number} · {chapter.level.name}
          </span>
        </div>

        <header className="relative overflow-hidden rounded-lg border border-hijau-t bg-gradient-to-br from-hijau-t via-white to-hijau-t/60 p-5 dark:border-claude/25 dark:from-claude/10 dark:via-card-1 dark:to-claude/10 sm:p-7">
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 max-w-3xl">
              <h1 className="font-headline text-2xl font-medium leading-tight text-gray-950 dark:text-white sm:text-3xl">
                {chapter.name}
              </h1>
              {chapter.description && (
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {chapter.description}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-claude" />
                  {formatChapterSessionDate(
                    chapter.session_date,
                    "dddd, D MMMM YYYY · HH:mm [WIB]",
                  )}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-claude" />
                  {formatChapterDuration(chapter.duration_minutes)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-claude" />
                  {chapter.location_name?.trim() ||
                    (chapter.method === "online"
                      ? "Online"
                      : "Lokasi belum tersedia")}
                  {location && (
                    <a
                      href={location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-claude underline underline-offset-2 dark:text-lime-bright"
                    >
                      Buka lokasi
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </span>
              </div>
            </div>
            <div className="w-full rounded-lg border border-hijau-t bg-white/70 p-4 dark:border-claude/20 dark:bg-card-1/60 xl:w-56 xl:shrink-0">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progres konten</span>
                <span className="font-medium text-claude dark:text-lime-bright">
                  {chapter.done_tasks}/{chapter.total_tasks}
                </span>
              </div>
              <progress
                value={chapter.done_tasks}
                max={chapter.total_tasks || 1}
                aria-label={`Progres ${chapter.name}`}
                className="mt-3 h-2 w-full overflow-hidden rounded-full accent-claude [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-claude [&::-moz-progress-bar]:bg-claude"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {unlocked
                  ? "Lanjutkan dari tahap yang belum selesai."
                  : "Chapter belum dibuka."}
              </p>
            </div>
          </div>
        </header>

        {!unlocked ? (
          <div className="rounded-lg border border-dashboard-border bg-card-1 p-8 text-center">
            <LockKeyhole className="mx-auto size-8 text-claude" />
            <h2 className="mt-3 font-headline text-xl font-medium">
              Chapter ini belum terbuka
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Materi dan tugas tersedia setelah admin membuka sesi chapter.
            </p>
          </div>
        ) : !learnings ? (
          <div className="rounded-lg border border-dashboard-border bg-card-1 p-8 text-center">
            <h2 className="font-headline text-xl font-medium">
              Tugas belum berhasil dimuat
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Coba muat ulang halaman.
            </p>
            <ButtonAILN variant="forest" onClick={() => router.refresh()}>
              <RotateCcw className="size-4" />
              Muat ulang
            </ButtonAILN>
          </div>
        ) : (
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.85fr)] xl:items-start">
            <div className="min-w-0 space-y-5">
              {(learnings?.videos.length ?? 0) > 1 && (
                <div className="flex flex-col gap-2 rounded-lg border border-dashboard-border bg-card-1 p-4">
                  <label
                    htmlFor="chapter-video"
                    className="text-sm font-medium"
                  >
                    Pilih video chapter
                  </label>
                  <select
                    id="chapter-video"
                    value={activeVideo?.id ?? ""}
                    onChange={(event) => {
                      setActiveVideoId(Number(event.target.value));
                      setCurrentTime(0);
                    }}
                    className="w-full rounded-lg border border-dashboard-border bg-card-2 p-3 text-sm"
                  >
                    {learnings?.videos.map((video) => (
                      <option key={video.id} value={video.id}>
                        {video.title}
                        {video.completed || completedVideoIds.has(video.id)
                          ? " · Sudah ditonton"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <section className="overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
                <PanelHeading
                  icon={<MonitorPlay className="size-5" />}
                  title="Video pembelajaran"
                  detail={activeVideo?.title ?? "Rekaman chapter"}
                />
                <div className="p-3 sm:p-5">
                  {videoVisible ? (
                    <div className="overflow-hidden rounded-lg border border-dashboard-border bg-neutral-900">
                      {!activeVideo || !embedUrl ? (
                        <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center text-white">
                          <MonitorPlay className="size-10 text-white/70" />
                          {externalVideoUrl ? (
                            <>
                              <p className="font-headline text-lg font-medium">
                                Video diputar di tab baru
                              </p>
                              <ButtonAILN
                                asChild
                                variant="outline"
                                size="small"
                              >
                                <a
                                  href={externalVideoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Tonton video
                                  <ExternalLink className="size-3.5" />
                                </a>
                              </ButtonAILN>
                            </>
                          ) : (
                            <>
                              <p className="font-headline text-lg font-medium">
                                Video YouTube belum tersedia
                              </p>
                              <p className="text-sm text-white/60">
                                Lanjutkan dengan materi chapter di bawah.
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <iframe
                          ref={playerRef}
                          key={activeVideo.id}
                          src={`${embedUrl}?enablejsapi=1`}
                          onLoad={() =>
                            postToPlayer({
                              event: "listening",
                              channel: "widget",
                            })
                          }
                          title={activeVideo.title}
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                          className="aspect-video w-full"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg bg-neutral-900 px-6 text-center text-white">
                      <LockKeyhole className="size-8 text-white/70" />
                      <p className="font-headline text-lg font-medium">
                        Video belum terbuka
                      </p>
                      <p className="text-sm text-white/65">
                        Kerjakan pre-test terlebih dahulu.
                      </p>
                    </div>
                  )}
                  {activeVideo && videoVisible && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-950 dark:text-white">
                          {activeVideo.title}
                        </p>
                        {activeVideo.description && (
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {activeVideo.description}
                          </p>
                        )}
                      </div>
                      {activeVideo.completed ||
                      completedVideoIds.has(activeVideo.id) ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-claude dark:text-lime-bright">
                          <Check className="size-4" />
                          Sudah ditonton
                        </span>
                      ) : (
                        (embedUrl || externalVideoUrl) && (
                          <ButtonAILN
                            variant="outline"
                            size="small"
                            disabled={savingVideoId !== null}
                            onClick={() => void markVideoComplete(activeVideo)}
                          >
                            {savingVideoId === activeVideo.id
                              ? "Menyimpan..."
                              : "Tandai sudah ditonton"}
                          </ButtonAILN>
                        )
                      )}
                    </div>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
                <PanelHeading
                  icon={<ListVideo className="size-5" />}
                  title="Lompat ke menit"
                  detail={
                    videoTimestamps.length
                      ? `${videoTimestamps.length} bagian di video ini`
                      : "Pilih waktu untuk langsung menuju bagian video."
                  }
                />
                <div className="p-5 sm:p-6">
                  {videoVisible && activeVideo && embedUrl ? (
                    videoTimestamps.length ? (
                      <ol className="-mx-2 space-y-1">
                        {videoTimestamps.map((timestamp, index) => {
                          const active = index === activeTimestampIndex;
                          return (
                            <li key={timestamp.start_seconds}>
                              <button
                                type="button"
                                onClick={() =>
                                  seekVideo(timestamp.start_seconds)
                                }
                                aria-current={active ? "true" : undefined}
                                className={`group flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-claude ${active ? "bg-hijau-t dark:bg-claude/15" : "hover:bg-card-2"}`}
                              >
                                <span
                                  className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium tabular-nums ${active ? "bg-claude text-white" : "bg-card-2 text-claude group-hover:bg-hijau-t dark:text-lime-bright dark:group-hover:bg-claude/15"}`}
                                >
                                  {getDurationFromSeconds(
                                    timestamp.start_seconds,
                                  )}
                                </span>
                                <span
                                  className={`pt-0.5 text-sm leading-5 ${active ? "font-medium text-gray-950 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                                >
                                  {timestamp.title}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <>
                        <div className="mb-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Shortcut setiap 5 menit · mengikuti durasi sesi
                          </span>
                          <span>Pilihan {formatMinute(currentTime)}</span>
                        </div>
                        <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                          {shortcuts.map((seconds) => (
                            <button
                              key={seconds}
                              type="button"
                              onClick={() => seekVideo(seconds)}
                              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-claude ${Math.floor(currentTime / 300) * 300 === seconds ? "border-claude bg-claude text-white" : "border-dashboard-border bg-card-2 text-gray-700 hover:border-claude hover:text-claude dark:text-gray-200"}`}
                            >
                              {formatMinute(seconds)}
                            </button>
                          ))}
                        </div>
                      </>
                    )
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Shortcut tersedia saat video YouTube chapter dapat
                      diputar.
                    </p>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
                <PanelHeading
                  icon={<BookOpen className="size-5" />}
                  title="Materi chapter"
                  detail={`${learnings.materials.length} materi untuk dipelajari`}
                />
                {learnings.materials.length ? (
                  <div className="divide-y divide-dashboard-border">
                    {learnings.materials.map((material) => {
                      const locked = !contentUnlocked && !material.completed;
                      const detail = materialDetails[material.id];
                      const article = renderedMaterials[material.id];
                      const done =
                        material.completed ||
                        completedMaterialIds.has(material.id);
                      const showBody = !locked && !!detail;
                      return (
                        <div key={material.id} className="px-5 py-5 sm:px-6">
                          <h3 className="sr-only">{material.title}</h3>

                          {locked && (
                            <p className="inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                              <LockKeyhole className="size-4" />
                              Kerjakan pre-test dahulu untuk membuka materi.
                            </p>
                          )}

                          {!locked && !detail && (
                            <Link
                              href={`${base}/materials/${material.id}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-claude hover:underline dark:text-lime-bright"
                            >
                              Buka materi
                              <ArrowRight className="size-4" />
                            </Link>
                          )}

                          {showBody && (
                            <div className="space-y-5">
                              {detail.file_url &&
                                (isPdfUrl(detail.file_url) ? (
                                  <div className="overflow-hidden rounded-lg border border-dashboard-border">
                                    <div className="flex items-center justify-between gap-3 border-b border-dashboard-border bg-card-2 px-4 py-2.5">
                                      <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                                        <FileText className="size-4 text-red-500" />
                                        Materi pendukung (PDF)
                                      </span>
                                      <a
                                        href={detail.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-claude hover:underline dark:text-lime-bright"
                                      >
                                        Buka di tab baru
                                        <ExternalLink className="size-3" />
                                      </a>
                                    </div>
                                    <iframe
                                      src={`${detail.file_url}#view=FitH&navpanes=0`}
                                      title={material.title}
                                      loading="lazy"
                                      className="h-[70vh] min-h-96 w-full bg-neutral-800"
                                    />
                                  </div>
                                ) : (
                                  <ButtonAILN
                                    asChild
                                    variant="outline"
                                    size="small"
                                  >
                                    <a
                                      href={detail.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Buka file materi
                                      <ExternalLink className="size-3.5" />
                                    </a>
                                  </ButtonAILN>
                                ))}
                              {article && (
                                <article
                                  className={styles.prose}
                                  dangerouslySetInnerHTML={{ __html: article }}
                                />
                              )}
                              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashboard-border bg-card-2 px-4 py-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {done
                                    ? "Materi ini sudah ditandai selesai."
                                    : "Selesai membaca? Tandai supaya quiz bisa dibuka."}
                                </p>
                                {done ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-claude dark:text-lime-bright">
                                    <Check className="size-4" />
                                    Sudah dibaca
                                  </span>
                                ) : (
                                  <ButtonAILN
                                    variant="forest"
                                    size="small"
                                    disabled={savingMaterialId !== null}
                                    onClick={() =>
                                      void markMaterialComplete(material.id)
                                    }
                                  >
                                    {savingMaterialId === material.id
                                      ? "Menyimpan..."
                                      : "Tandai sudah dibaca"}
                                  </ButtonAILN>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="p-6 text-sm text-gray-500 dark:text-gray-400">
                    Belum ada materi untuk chapter ini.
                  </p>
                )}
              </section>
            </div>

            <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
              <section className="overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
                <PanelHeading
                  icon={<SquareCheckBig className="size-5" />}
                  title="Uji pemahamanmu"
                  detail="Kerjakan sesuai urutan untuk membuka tahap berikutnya."
                />
                <div className="bg-card-2/50 p-4 sm:p-5">
                  {evaluations.length ? (
                    <ol className="space-y-3">
                      {evaluations.map(({ key, ...evaluation }, index) => (
                        <EvaluationCard
                          key={key}
                          {...evaluation}
                          step={index + 1}
                          isLast={index === evaluations.length - 1}
                          isNext={key === nextEvaluationKey}
                        />
                      ))}
                    </ol>
                  ) : (
                    <p className="rounded-lg border border-dashboard-border bg-card-1 p-4 text-sm text-gray-500">
                      Belum ada evaluasi untuk chapter ini.
                    </p>
                  )}
                </div>
              </section>
              {survey && (
                <section className="rounded-lg bg-neutral-900 p-5 text-white dark:border dark:border-dashboard-border dark:bg-card-2">
                  <div>
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-lime-bright text-black">
                        <MessageSquareHeart className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/80">
                          Survei chapter
                        </p>
                        <h2 className="mt-0.5 font-headline text-lg font-medium leading-snug text-white">
                          Bagikan pengalamanmu
                        </h2>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/70">
                      Nilai trainer dan materi sesi ini. Masukanmu dipakai untuk
                      menyiapkan sesi berikutnya.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
                        {CHAPTER_SURVEY_RATING_KEYS.length} penilaian bintang
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
                        {CHAPTER_SURVEY_TEXT_KEYS.length} pertanyaan terbuka
                      </span>
                    </div>
                    <div className="mt-4">
                      {!survey.available && !survey.submitted ? (
                        <p className="flex items-start gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs leading-5 text-white/80">
                          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
                          Dibuka setelah admin membuka sesi chapter.
                        </p>
                      ) : survey.submitted ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
                            <Check className="size-4" />
                            Terima kasih, survei terkirim
                          </span>
                          <ButtonAILN
                            variant="light"
                            size="small"
                            onClick={() => setIsSurveyOpen(true)}
                          >
                            Lihat jawaban
                            <ArrowRight className="size-3.5" />
                          </ButtonAILN>
                        </div>
                      ) : (
                        <ButtonAILN
                          variant="light"
                          size="medium"
                          width="full"
                          onClick={() => setIsSurveyOpen(true)}
                        >
                          Isi survei sekarang
                          <ArrowRight className="size-4" />
                        </ButtonAILN>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </aside>
          </div>
        )}

        {nextChapter && (
          <Link
            href={`${base}/learning-path/${nextChapter.id}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-dashboard-border bg-card-1 p-5 transition-colors hover:bg-card-2"
          >
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chapter berikutnya
              </p>
              <p className="mt-1 font-headline text-lg font-medium text-gray-950 dark:text-white">
                {nextChapter.name}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-claude" />
          </Link>
        )}
        <AlertConfirmDialogAILN
          isOpen={quizToStart !== null}
          alertDialogHeader="Mulai quiz sekarang?"
          alertDialogMessage="Waktu quiz akan langsung berjalan setelah halaman dibuka dan tidak bisa dijeda."
          alertCancelLabel="Batal"
          alertConfirmLabel="Mulai quiz"
          onClose={() => setQuizToStart(null)}
          onConfirm={() => {
            if (!quizToStart) return;
            router.push(`${base}/quizzes/${quizToStart}`);
            setQuizToStart(null);
          }}
        />
        <ChapterSurveyModalAILN
          chapterId={chapter.id}
          isOpen={isSurveyOpen}
          onClose={() => setIsSurveyOpen(false)}
          onSuccess={() => router.refresh()}
        />
      </div>
    </PageContainerAILN>
  );
}
