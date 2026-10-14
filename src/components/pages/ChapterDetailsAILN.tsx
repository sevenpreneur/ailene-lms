"use client";

import type {
  ChapterLearnings,
  LearningVideo,
  StudentChapter,
} from "@/apis/learnings";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import { CHAPTER_TEST_LOCKED_MESSAGE } from "@/lib/chapter-evaluation";
import {
  formatChapterDuration,
  formatChapterSessionDate,
} from "@/lib/date-time-manipulation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  ExternalLink,
  LockKeyhole,
  MapPin,
  MonitorPlay,
  Play,
  RotateCcw,
  SquareCheckBig,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

type VideoSource =
  | { kind: "unavailable" }
  | { kind: "file" | "embed" | "link"; url: string };

function videoSource(raw: string): VideoSource {
  if (!raw || raw === "#") return { kind: "unavailable" };
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { kind: "unavailable" };
    }

    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    if (/\.(mp4|webm|ogg)$/i.test(path)) {
      return { kind: "file", url: url.toString() };
    }
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      const id = host.includes("youtu.be")
        ? path.split("/")[1]
        : url.searchParams.get("v") || path.split("/").filter(Boolean).slice(-1)[0];
      if (id && /^[\w-]{11}$/.test(id)) {
        return { kind: "embed", url: `https://www.youtube-nocookie.com/embed/${id}` };
      }
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const id = path.split("/").filter(Boolean).slice(-1)[0];
      if (id && /^\d+$/.test(id)) {
        return { kind: "embed", url: `https://player.vimeo.com/video/${id}` };
      }
    }
    if (host === "iframe.videodelivery.net" || (host.endsWith(".cloudflarestream.com") && path.includes("/iframe"))) {
      return { kind: "embed", url: url.toString() };
    }
    return { kind: "link", url: url.toString() };
  } catch {
    return { kind: "unavailable" };
  }
}

function locationHref(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function StepSection({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
      <div className="flex items-center gap-3 border-b border-dashboard-border px-5 py-4 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-deep font-headline text-sm font-medium text-white">
          {String(number).padStart(2, "0")}
        </span>
        <div>
          <h2 className="font-headline text-lg font-medium text-gray-950 dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="divide-y divide-dashboard-border">{children}</div>
    </section>
  );
}

function TaskRow({
  label,
  title,
  detail,
  done,
  lockedReason,
  actionLabel,
  href,
  onAction,
  selected = false,
}: {
  label: string;
  title: string;
  detail?: string | null;
  done: boolean;
  lockedReason?: string | null;
  actionLabel: string;
  href?: string;
  onAction?: () => void;
  selected?: boolean;
}) {
  const actionClass =
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gray-950 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-claude dark:bg-white dark:text-gray-950 dark:hover:bg-lime-bright";

  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${done ? "bg-hijau-t text-claude dark:bg-claude/20 dark:text-lime-bright" : lockedReason ? "bg-gray-100 text-gray-400 dark:bg-white/10" : "bg-[#e3f3f8] text-claude dark:bg-claude/20"}`}>
          {done ? <Check className="h-3.5 w-3.5" /> : lockedReason ? <LockKeyhole className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400">
            {label}
          </div>
          <div className="font-medium text-gray-900 dark:text-white">{title}</div>
          {detail && <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{detail}</p>}
          {lockedReason && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{lockedReason}</p>}
        </div>
      </div>
      {lockedReason ? (
        <span className="shrink-0 text-xs font-medium text-gray-400">Belum tersedia</span>
      ) : selected ? (
        <span className="shrink-0 rounded-lg bg-hijau-t px-3 py-2 text-xs font-medium text-claude dark:bg-claude/20 dark:text-lime-bright">Tampil di bawah</span>
      ) : href ? (
        <Link href={href} className={actionClass}>
          {actionLabel}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : onAction ? (
        <button type="button" onClick={onAction} className={actionClass}>
          {actionLabel}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function InlineVideo({
  video,
  source,
  onEnded,
}: {
  video: LearningVideo | null;
  source: VideoSource;
  onEnded: () => void;
}) {
  if (!video || source.kind === "unavailable") {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg bg-forest-deep px-6 text-center text-white">
        <MonitorPlay className="h-10 w-10 text-lime-bright" aria-hidden="true" />
        <div className="font-headline text-lg font-medium">
          {video ? "Rekaman belum tersedia" : "Belum ada video di chapter ini"}
        </div>
        <p className="max-w-sm text-sm text-white/65">
          {video ? "Video akan dapat diputar di sini setelah tautannya ditambahkan." : "Lanjutkan ke tugas berikutnya."}
        </p>
      </div>
    );
  }

  if (source.kind === "file") {
    return (
      <video
        key={video.id}
        className="aspect-video w-full rounded-lg bg-black"
        src={source.url}
        controls
        playsInline
        preload="metadata"
        onEnded={onEnded}
      >
        Browser kamu belum mendukung pemutaran video ini.
      </video>
    );
  }

  if (source.kind === "embed") {
    return (
      <iframe
        key={video.id}
        className="aspect-video w-full rounded-lg bg-black"
        src={source.url}
        title={video.title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-lg bg-forest-deep px-6 text-center text-white">
      <Play className="h-10 w-10 text-lime-bright" aria-hidden="true" />
      <p className="max-w-sm text-sm">Format video ini dibuka melalui penyedianya.</p>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-forest-deep">
        Buka video <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}

export default function ChapterDetailsAILN({
  chapter,
  learnings,
  unlocked,
  projectId,
  nextChapter,
}: {
  chapter: StudentChapter;
  learnings: ChapterLearnings | null;
  unlocked: boolean;
  projectId: string;
  nextChapter: StudentChapter | null;
}) {
  const router = useRouter();
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(
    learnings?.videos.find((video) => videoSource(video.video_url).kind !== "unavailable")?.id ??
      learnings?.videos[0]?.id ?? null
  );
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<number>>(new Set());
  const [savingVideoId, setSavingVideoId] = useState<number | null>(null);
  const [quizToStart, setQuizToStart] = useState<string | null>(null);
  const preTest = learnings?.pre_test ?? null;
  const postTest = learnings?.post_test ?? null;
  const survey = learnings?.survey ?? null;
  const contentUnlocked = unlocked && (!preTest || preTest.submitted);
  const allMaterialsRead = learnings?.materials.every((material) => material.completed) ?? false;
  const activeVideo = learnings?.videos.find((video) => video.id === selectedVideoId) ?? null;
  const activeSource = videoSource(activeVideo?.video_url ?? "");
  const location = locationHref(chapter.location_url);
  const base = `/${projectId}/student`;
  const stageOrder = [
    preTest && "pre-test",
    learnings?.materials.length && "materials",
    learnings?.videos.length && "videos",
    learnings?.quizzes.length && "quizzes",
    (postTest || survey) && "finish",
  ].filter(Boolean);
  const stepNumber = (stage: string) => stageOrder.indexOf(stage) + 1;

  const markVideoComplete = async (video: LearningVideo) => {
    if (video.completed || completedVideoIds.has(video.id) || savingVideoId !== null) return;
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12">
        <Link href={`${base}/learning-path`} className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 hover:text-claude dark:text-gray-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Semua chapter
        </Link>

        <header className="overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
          <div className="bg-[#e3f3f8] p-6 dark:bg-[#213640] sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-white/10 dark:text-white">Level {chapter.level.level_number} · {chapter.level.name}</span>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-white/10 dark:text-white">
                {unlocked ? chapter.progress === "completed" ? "Konten selesai" : chapter.progress === "in_progress" ? "Sedang berjalan" : "Belum dimulai" : "Terkunci"}
              </span>
            </div>
            <h1 className="font-headline text-3xl font-medium text-gray-950 dark:text-white sm:text-4xl">{chapter.name}</h1>
            {chapter.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">{chapter.description}</p>}
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700 dark:text-gray-200">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatChapterSessionDate(chapter.session_date, "dddd, D MMMM YYYY · HH:mm [WIB]")}</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{formatChapterDuration(chapter.duration_minutes)}</span>
              <span className="inline-flex items-center gap-2"><MonitorPlay className="h-4 w-4" />{chapter.method === "online" ? "Online" : "Tatap muka"}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{chapter.location_name?.trim() || "Lokasi belum tersedia"}</span>
              {location && <a href={location} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-claude underline underline-offset-2 dark:text-lime-bright">Buka lokasi<ExternalLink className="h-3.5 w-3.5" /></a>}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm sm:px-8">
            <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300"><SquareCheckBig className="h-4 w-4 text-claude" />{chapter.done_tasks} dari {chapter.total_tasks} konten utama selesai</span>
            <progress value={chapter.done_tasks} max={chapter.total_tasks || 1} aria-label={`Progres ${chapter.name}`} className="h-2 w-full overflow-hidden rounded-full accent-claude sm:max-w-48 [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-claude [&::-moz-progress-bar]:bg-claude" />
          </div>
        </header>

        {!unlocked ? (
          <div className="rounded-lg border border-dashboard-border bg-card-1 p-6 text-center sm:p-10">
            <LockKeyhole className="mx-auto h-8 w-8 text-claude" aria-hidden="true" />
            <h2 className="mt-3 font-headline text-xl font-medium dark:text-white">Chapter ini belum terbuka</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Selesaikan level sebelumnya. Jadwal dan lokasi sesi tetap bisa kamu lihat di atas.</p>
          </div>
        ) : !learnings ? (
          <div className="rounded-lg border border-dashboard-border bg-card-1 p-6 text-center sm:p-10">
            <h2 className="font-headline text-xl font-medium dark:text-white">Tugas belum berhasil dimuat</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Coba muat ulang halaman untuk melihat langkah belajar.</p>
            <button type="button" onClick={() => router.refresh()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-forest-deep px-4 py-2 text-sm font-medium text-white"><RotateCcw className="h-4 w-4" />Muat ulang</button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="font-headline text-xl font-medium text-gray-950 dark:text-white">Yang perlu kamu kerjakan</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ikuti langkah di bawah. Tugas yang selesai tetap bisa dibuka kembali.</p>
            </div>

            {preTest && (
              <StepSection number={stepNumber("pre-test")} title="Mulai dari pre-test" subtitle="Kenali titik awal sebelum mempelajari materinya.">
                <TaskRow
                  label="Pre-test"
                  title={preTest.name}
                  detail={preTest.description || `${preTest.question_count} pertanyaan`}
                  done={preTest.submitted}
                  lockedReason={!preTest.available && !preTest.submitted ? (preTest.locked_reason ? CHAPTER_TEST_LOCKED_MESSAGE[preTest.locked_reason] : null) ?? "Belum tersedia" : null}
                  actionLabel={preTest.submitted ? "Lihat hasil" : "Kerjakan"}
                  href={`${base}/chapter-tests/${preTest.id}`}
                />
              </StepSection>
            )}

            {learnings.materials.length > 0 && (
              <StepSection number={stepNumber("materials")} title="Baca materi" subtitle="Baca setiap materi untuk membuka tahap berikutnya.">
                {learnings.materials.map((material) => (
                  <TaskRow
                    key={material.id}
                    label="Materi"
                    title={material.title}
                    detail={material.description}
                    done={material.completed}
                    lockedReason={!contentUnlocked && !material.completed ? "Kerjakan pre-test chapter ini dulu" : null}
                    actionLabel={material.completed ? "Baca lagi" : "Baca materi"}
                    href={`${base}/materials/${material.id}`}
                  />
                ))}
              </StepSection>
            )}

            {learnings.videos.length > 0 && (
              <StepSection number={stepNumber("videos")} title="Tonton video" subtitle="Pilih rekaman dan tonton langsung di halaman ini.">
                {learnings.videos.map((video) => (
                  <TaskRow
                    key={video.id}
                    label="Video"
                    title={video.title}
                    detail={video.description || (videoSource(video.video_url).kind === "unavailable" ? "Rekaman belum tersedia" : null)}
                    done={video.completed || completedVideoIds.has(video.id)}
                    lockedReason={!contentUnlocked && !video.completed ? "Kerjakan pre-test chapter ini dulu" : null}
                    actionLabel="Tonton video"
                    onAction={() => setSelectedVideoId(video.id)}
                    selected={selectedVideoId === video.id}
                  />
                ))}
                <div className="bg-card-2 p-5 sm:p-6">
                  {contentUnlocked || activeVideo?.completed ? (
                    <>
                      <InlineVideo video={activeVideo} source={activeSource} onEnded={() => activeVideo && void markVideoComplete(activeVideo)} />
                      {activeVideo && activeSource.kind !== "unavailable" && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">{activeVideo.title}</div>
                          {activeVideo.completed || completedVideoIds.has(activeVideo.id) ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-claude dark:text-lime-bright"><Check className="h-4 w-4" />Sudah ditonton</span>
                          ) : (
                            <button type="button" disabled={savingVideoId !== null} onClick={() => void markVideoComplete(activeVideo)} className="rounded-lg border border-dashboard-border bg-card-1 px-3 py-2 text-xs font-medium text-gray-800 hover:bg-hijau-t disabled:opacity-50 dark:text-white">
                              {savingVideoId === activeVideo.id ? "Menyimpan..." : "Tandai sudah ditonton"}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-lg bg-forest-deep px-6 text-center text-sm text-white/70">Kerjakan pre-test untuk membuka video.</div>
                  )}
                </div>
              </StepSection>
            )}

            {learnings.quizzes.length > 0 && (
              <StepSection number={stepNumber("quizzes")} title="Uji pemahaman" subtitle="Quiz terbuka setelah semua materi dibaca.">
                {learnings.quizzes.map((quiz) => (
                  <TaskRow
                    key={quiz.id}
                    label="Quiz"
                    title={quiz.name}
                    detail={`${quiz.question_count} pertanyaan · ${quiz.xp_reward} XP`}
                    done={quiz.attempts > 0}
                    lockedReason={!contentUnlocked && quiz.attempts === 0 && !quiz.active_attempt_started_at ? "Kerjakan pre-test chapter ini dulu" : !allMaterialsRead && quiz.attempts === 0 && !quiz.active_attempt_started_at ? "Baca semua materi terlebih dahulu" : null}
                    actionLabel={quiz.attempts > 0 ? "Lihat hasil" : quiz.active_attempt_started_at ? "Lanjutkan quiz" : "Mulai quiz"}
                    href={quiz.attempts > 0 || quiz.active_attempt_started_at ? `${base}/quizzes/${quiz.id}` : undefined}
                    onAction={quiz.attempts === 0 && !quiz.active_attempt_started_at ? () => setQuizToStart(quiz.id) : undefined}
                  />
                ))}
              </StepSection>
            )}

            {(postTest || survey) && (
              <StepSection number={stepNumber("finish")} title="Akhiri chapter" subtitle="Selesaikan evaluasi dan berikan tanggapanmu.">
                {postTest && (
                  <TaskRow
                    label="Post-test"
                    title={postTest.name}
                    detail={postTest.description || `${postTest.question_count} pertanyaan`}
                    done={postTest.submitted}
                    lockedReason={!postTest.available && !postTest.submitted ? (postTest.locked_reason ? CHAPTER_TEST_LOCKED_MESSAGE[postTest.locked_reason] : null) ?? "Belum tersedia" : null}
                    actionLabel={postTest.submitted ? "Lihat hasil" : "Kerjakan"}
                    href={`${base}/chapter-tests/${postTest.id}`}
                  />
                )}
                {survey && (
                  <TaskRow
                    label="Survei"
                    title="Survei kepuasan chapter"
                    detail="Bagikan pengalamanmu setelah mengikuti sesi."
                    done={survey.submitted}
                    lockedReason={!survey.available && !survey.submitted ? "Dibuka setelah sesi chapter dimulai" : null}
                    actionLabel={survey.submitted ? "Lihat jawaban" : "Isi survei"}
                    href={`${base}/surveys/${chapter.id}`}
                  />
                )}
              </StepSection>
            )}

            {learnings.materials.length === 0 && learnings.videos.length === 0 && learnings.quizzes.length === 0 && !preTest && !postTest && !survey && (
              <div className="rounded-lg border border-dashboard-border bg-card-1 p-8 text-center text-sm text-gray-500">Belum ada materi atau tugas untuk chapter ini.</div>
            )}
          </div>
        )}

        {nextChapter && (
          <Link href={`${base}/learning-path/${nextChapter.id}`} className="flex items-center justify-between gap-4 rounded-lg border border-dashboard-border bg-card-1 p-5 transition-colors hover:bg-card-2">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Chapter berikutnya</div>
              <div className="font-headline text-lg font-medium text-gray-900 dark:text-white">{nextChapter.name}</div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-claude" aria-hidden="true" />
          </Link>
        )}
      </div>
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
    </PageContainerAILN>
  );
}
