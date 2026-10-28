"use client";
import SelectAILN from "@/components/fields/SelectAILN";

import type { ChapterSurveyDetail } from "@/apis/chapter-surveys";
import type { ChapterTask } from "@/apis/chapter-tasks";
import type { ChapterTestKind, ChapterTestTask } from "@/apis/chapter-tests";
import type { ChapterDetail } from "@/apis/chapters";
import type { ChapterVideo, MaterialDetail } from "@/apis/learnings";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ChapterHeroAILN from "@/components/heroes/ChapterHeroAILN";
import ChapterTasksStudentAILN from "@/components/indexes/ChapterTasksStudentAILN";
import ChapterSurveyModalAILN from "@/components/modals/ChapterSurveyModalAILN";
import styles from "@/components/css/MaterialDetails.module.css";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import { isPdfUrl, renderMaterialArticle } from "@/lib/material-content";
import {
  CHAPTER_SURVEY_RATING_KEYS,
  CHAPTER_SURVEY_TEXT_KEYS,
  CHAPTER_TEST_KIND_LABEL,
  CHAPTER_TEST_LOCKED_MESSAGE,
} from "@/lib/chapter-evaluation";
import { getDurationFromSeconds } from "@/lib/date-time-manipulation";
import { httpHref } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ExternalLink,
  FileText,
  ListChecks,
  LockKeyhole,
  MessageSquareHeart,
  MonitorPlay,
  TicTacToe,
  Trophy,
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

function formatMinute(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
function PanelHeading({
  icon,
  title,
  detail,
  action,
}: {
  icon: ReactNode;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-dashboard-border px-5 py-4 sm:px-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sevenpreneur-coal text-white dark:bg-white dark:text-sevenpreneur-coal">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-headline text-lg font-medium text-gray-950 dark:text-white">
          {title}
        </h2>
        {detail && (
          <p className="mt-0.5 text-xs leading-5 text-gray-600 dark:text-gray-400">
            {detail}
          </p>
        )}
      </div>
      {action && <div className="w-full sm:w-64">{action}</div>}
    </div>
  );
}
function SectionHeading({
  id,
  title,
  detail,
  action,
}: {
  id: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2
          id={id}
          className="font-headline text-2xl font-medium text-gray-950 dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {detail}
        </p>
      </div>
      {action && <div className="w-full shrink-0 sm:w-64">{action}</div>}
    </div>
  );
}

function EvaluationChip({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashboard-border bg-card-2 px-2 py-0.5 text-[13px] font-medium text-gray-600 dark:text-gray-300">
      {icon && icon}
      {children}
    </span>
  );
}

function EvaluationCard({
  kind,
  isNext,
  label,
  title,
  questionCount,
  score,
  done,
  lockedReason,
  actionLabel,
  href,
}: {
  kind: ChapterTestKind;
  isNext: boolean;
  label: string;
  title: string;
  questionCount: number;
  score: number | null;
  done: boolean;
  lockedReason: string | null;
  actionLabel: string;
  href: string;
}) {
  const locked = !!lockedReason;
  const description =
    kind === "pre_test"
      ? "Ukur pemahaman awal sebelum sesi dimulai."
      : "Ukur pemahaman setelah materi selesai.";
  const buttonVariant = done ? "outline" : isNext ? "dark" : "neutral";
  const buttonContent = (
    <>
      {actionLabel}
      <ArrowRight className="size-3.5" />
    </>
  );

  return (
    <li className="overflow-hidden rounded-lg border border-dashboard-border bg-gray-50 dark:bg-card-1">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashboard-border bg-white dark:bg-white/10 ${locked ? "text-gray-400" : "text-claude dark:text-lime-bright"}`}
        >
          <TicTacToe className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-headline text-lg font-medium leading-snug text-gray-950 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-gray-600 dark:text-gray-400">
            {description}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <EvaluationChip icon={<ListChecks className="size-3" />}>
              {questionCount} soal
            </EvaluationChip>
            <EvaluationChip>{label}</EvaluationChip>
            {done && score !== null && (
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

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <span
            className={`inline-flex h-8 items-center rounded-full px-3 text-[13px] font-medium ${done ? "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright" : locked ? "bg-card-2 text-gray-500 dark:text-gray-400" : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"}`}
          >
            {done ? "Selesai" : locked ? "Terkunci" : "Siap dikerjakan"}
          </span>
          {!locked && (
            <ButtonAILN asChild variant={buttonVariant} size="small">
              <Link href={href}>{buttonContent}</Link>
            </ButtonAILN>
          )}
        </div>
      </div>
      {locked && (
        <p className="flex items-start gap-2 border-t border-dashboard-border px-4 py-3 text-[13px] leading-5 text-amber-800 dark:text-amber-300 sm:px-5">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
          {lockedReason}
        </p>
      )}
    </li>
  );
}

export default function ChapterDetailsAILN({
  chapter,
  tests,
  videos,
  materials,
  practiceTasks,
  chapterOrder,
  survey,
  unlocked,
  projectId,
  initialSurveyOpen = false,
}: {
  chapter: ChapterDetail;
  tests: ChapterTestTask[];
  videos: ChapterVideo[];
  materials: MaterialDetail[];
  practiceTasks: ChapterTask[];
  chapterOrder: number[];
  survey: ChapterSurveyDetail | null;
  unlocked: boolean;
  projectId: string;
  initialSurveyOpen?: boolean;
}) {
  const router = useRouter();
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const activeVideo =
    videos.find((video) => video.id === activeVideoId) ?? videos[0] ?? null;
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
        materials.map((material) => [
          material.id,
          material.content ? renderMaterialArticle(material.content).html : "",
        ]),
      ),
    [materials],
  );
  const [isSurveyOpen, setIsSurveyOpen] = useState(initialSurveyOpen);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const preTest = tests.find((test) => test.kind === "pre_test") ?? null;
  const surveySubmitted = !!survey?.response;
  const nextChapter = chapter.next_chapter;
  const contentUnlocked = unlocked && (!preTest || preTest.submitted);
  const videoVisible = contentUnlocked || !!activeVideo?.completed;
  const base = `/${projectId}/student`;
  const evaluations = tests.map((test) => {
    const label = CHAPTER_TEST_KIND_LABEL[test.kind];
    return {
      key: test.kind,
      kind: test.kind,
      label,
      title: test.name,
      questionCount: test.question_count,
      score: test.score,
      done: test.submitted,
      lockedReason:
        !test.available && !test.submitted
          ? test.locked_reason
            ? CHAPTER_TEST_LOCKED_MESSAGE[test.locked_reason]
            : "Belum tersedia"
          : null,
      actionLabel: test.submitted
        ? "Lihat hasil"
        : `Mulai ${label.toLowerCase()}`,
      href: `${base}/chapter-tests/${test.id}`,
    };
  });
  const nextEvaluationKey = evaluations.find(
    (evaluation) => !evaluation.done && !evaluation.lockedReason,
  )?.key;
  const embedUrl = youtubeEmbedUrl(activeVideo?.video_url ?? "");
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

  const markVideoComplete = async (video: ChapterVideo) => {
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
        <div>
          <ButtonAILN
            variant="neutral"
            size="small"
            onClick={() => router.push(`${base}/learning-path`)}
          >
            <ArrowLeft className="size-4" />
            Semua chapter
          </ButtonAILN>
        </div>

        <ChapterHeroAILN chapter={chapter} unlocked={unlocked} />

        {!unlocked ? (
          <div className="rounded-lg border border-dashboard-border bg-card-1 p-8 text-center">
            <LockKeyhole className="mx-auto size-8 text-claude" />
            <h2 className="mt-3 font-headline text-xl font-medium">
              Chapter ini belum terbuka
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Materi dan tugas tersedia setelah admin membuka sesi chapter.
            </p>
          </div>
        ) : (
          <div
            className={`grid min-w-0 gap-6 xl:items-start ${evaluations.length > 0 || survey ? "xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.85fr)]" : ""}`}
          >
            <div className="min-w-0 space-y-10">
              {practiceTasks.length > 0 && (
                <div id="tugas-praktik" className="scroll-mt-6">
                  <ChapterTasksStudentAILN
                    tasks={practiceTasks}
                    chapterOrder={chapterOrder}
                  />
                </div>
              )}

              {videos.length > 0 && (
                <section
                  id="video"
                  aria-labelledby="video-title"
                  className="flex scroll-mt-6 flex-col gap-4"
                >
                <SectionHeading
                  id="video-title"
                  title="Video Pembelajaran"
                  detail={
                    videoTimestamps.length
                      ? `${videoTimestamps.length} bagian · pilih bagian untuk melompat`
                      : (activeVideo?.title ?? "Rekaman chapter")
                  }
                  action={
                    videos.length > 1 ? (
                      <SelectAILN
                        selectId="chapter-video"
                        selectName="Pilih video chapter"
                        selectPlaceholder="Pilih video"
                        value={activeVideo?.id ?? ""}
                        onChange={(value) => {
                          setActiveVideoId(Number(value));
                          setCurrentTime(0);
                        }}
                        options={videos.map((video) => ({
                          value: video.id,
                          label: `${video.title}${video.completed || completedVideoIds.has(video.id) ? " · Sudah ditonton" : ""}`,
                        }))}
                      />
                    ) : undefined
                  }
                />
                <div className="overflow-hidden rounded-lg border border-dashboard-border bg-gray-50 dark:bg-card-1">
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
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-950 dark:text-white">
                          {activeVideo.title}
                        </p>
                        {activeVideo.description && (
                          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                            {activeVideo.description}
                          </p>
                        )}
                      </div>
                      {activeVideo.completed ||
                      completedVideoIds.has(activeVideo.id) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-hijau-t px-2.5 py-1 text-xs font-medium text-claude dark:bg-claude/15 dark:text-lime-bright">
                          <Check className="size-3.5" />
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
                  {videoVisible && activeVideo && embedUrl && (
                    <div className="border-t border-dashboard-border bg-sb-bg/60 px-3 py-4 sm:px-5">
                    <p className="mb-3 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-600 dark:text-gray-400">
                      {videoTimestamps.length
                        ? "Lompat ke bagian"
                        : "Lompat ke menit · setiap 5 menit"}
                    </p>
                    {videoTimestamps.length ? (
                      <ol className="grid gap-1.5 sm:grid-cols-2">
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
                                className={`group flex w-full items-start gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-claude ${active ? "border-claude bg-hijau-t dark:bg-claude/15" : "border-dashboard-border bg-card-1 hover:border-claude/50"}`}
                              >
                                <span
                                  className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium tabular-nums ${active ? "bg-claude text-white" : "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright"}`}
                                >
                                  {getDurationFromSeconds(
                                    timestamp.start_seconds,
                                  )}
                                </span>
                                <span
                                  className={`min-w-0 text-sm leading-5 ${active ? "font-medium text-gray-950 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                                >
                                  {timestamp.title}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                        {shortcuts.map((seconds) => (
                          <button
                            key={seconds}
                            type="button"
                            onClick={() => seekVideo(seconds)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-claude ${Math.floor(currentTime / 300) * 300 === seconds ? "border-claude bg-claude text-white" : "border-dashboard-border bg-card-1 text-gray-700 hover:border-claude hover:text-claude dark:text-gray-200"}`}
                          >
                            {formatMinute(seconds)}
                          </button>
                        ))}
                      </div>
                    )}
                    </div>
                  )}
                </div>
                </section>
              )}

              {materials.length > 0 && (
                <section
                  id="materi"
                  className="scroll-mt-6 overflow-hidden rounded-lg border border-dashboard-border bg-card-1"
                >
                  <PanelHeading
                    icon={<BookOpen className="size-5" />}
                    title="Materi chapter"
                    detail={`${materials.length} materi untuk dipelajari`}
                  />
                  <div className="divide-y divide-dashboard-border">
                    {materials.map((material) => {
                      const locked = !contentUnlocked && !material.completed;
                      const article = renderedMaterials[material.id];
                      const done =
                        material.completed ||
                        completedMaterialIds.has(material.id);
                      return (
                        <div key={material.id} className="px-5 py-5 sm:px-6">
                          <h3 className="sr-only">{material.title}</h3>

                          {locked && (
                            <p className="inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                              <LockKeyhole className="size-4" />
                              Kerjakan pre-test dahulu untuk membuka materi.
                            </p>
                          )}

                          {!locked && (
                            <div className="space-y-5">
                              {material.file_url &&
                                (isPdfUrl(material.file_url) ? (
                                  <div className="overflow-hidden rounded-lg border border-dashboard-border">
                                    <div className="flex items-center justify-between gap-3 border-b border-dashboard-border bg-card-2 px-4 py-2.5">
                                      <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                                        <FileText className="size-4 text-red-500" />
                                        Materi pendukung (PDF)
                                      </span>
                                      <a
                                        href={material.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-claude hover:underline dark:text-lime-bright"
                                      >
                                        Buka di tab baru
                                        <ExternalLink className="size-3" />
                                      </a>
                                    </div>
                                    <iframe
                                      src={`${material.file_url}#view=FitH&navpanes=0`}
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
                                      href={material.file_url}
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
                              <div
                                className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 ${done ? "border-claude/30 bg-hijau-t dark:bg-claude/10" : "border-dashboard-border bg-sb-bg/60"}`}
                              >
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {done
                                    ? "Materi ini sudah ditandai selesai."
                                    : "Selesai membaca? Tandai supaya post-test bisa dibuka."}
                                </p>
                                {done ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-claude dark:text-lime-bright">
                                    <Check className="size-4" />
                                    Sudah dibaca
                                  </span>
                                ) : (
                                  <ButtonAILN
                                    variant="dark"
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
                </section>
              )}

            </div>

            {(evaluations.length > 0 || survey) && (
              <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
                {evaluations.length > 0 && (
                  <section
                    id="evaluasi"
                    aria-labelledby="evaluasi-title"
                    className="flex scroll-mt-6 flex-col gap-4"
                  >
                    <SectionHeading
                      id="evaluasi-title"
                      title="Uji Pemahaman"
                      detail="Kerjakan sesuai urutan untuk membuka tahap berikutnya."
                    />
                  <ul className="space-y-3">
                    {evaluations.map(({ key, ...evaluation }) => (
                      <EvaluationCard
                        key={key}
                        {...evaluation}
                        isNext={key === nextEvaluationKey}
                      />
                    ))}
                    </ul>
                  </section>
                )}
                {survey && (
                  <section
                  id="survei"
                  className="scroll-mt-6 rounded-lg border border-forest-deep bg-forest-deep p-5 text-white dark:border-white/10"
                >
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
                    <p className="mt-3 text-xs leading-5 text-white/75">
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
                      {!survey.available && !surveySubmitted ? (
                        <p className="flex items-start gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs leading-5 text-white/80">
                          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
                          Survei belum dibuka oleh admin.
                        </p>
                      ) : surveySubmitted ? (
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
            )}
          </div>
        )}

        {nextChapter && (
          <Link
            href={`${base}/learning-path/${nextChapter.id}`}
            className="group flex items-center justify-between gap-4 rounded-lg border border-dashboard-border bg-card-1 p-5 transition-colors hover:border-claude focus-visible:outline-2 focus-visible:outline-claude"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-600 dark:text-gray-400">
                Chapter berikutnya
              </p>
              <p className="mt-1 font-headline text-lg font-medium text-gray-950 dark:text-white">
                {nextChapter.name}
              </p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-lime-bright text-forest-deep">
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </span>
          </Link>
        )}
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
