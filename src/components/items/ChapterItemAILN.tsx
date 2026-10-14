"use client";
import ChapterTaskItemAILN from "@/components/items/ChapterTaskItemAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import type { ChapterLearnings, StudentChapter } from "@/apis/learnings";
import { CHAPTER_TEST_LOCKED_MESSAGE } from "@/lib/chapter-evaluation";
import { faCheck, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import "dayjs/locale/id";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  ExternalLink,
  MapPin,
  Monitor,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

type ChapterProgress = "not_started" | "in_progress" | "completed";

const progressMeta: Record<
  ChapterProgress,
  { label: string; variant: GeneralLabelVariantAILN }
> = {
  not_started: { label: "Belum dimulai", variant: "white" },
  in_progress: { label: "Berjalan", variant: "blue" },
  completed: { label: "Selesai", variant: "green" },
};

interface ChapterItemAILNProps {
  chapter: StudentChapter;
  chapterNumber: number;
  unlocked: boolean;
  expanded: boolean;
  onToggle: () => void;
}

function formatSessionDuration(minutes: number): string {
  const sessionDuration = dayjs.duration(minutes, "minutes");
  const hours = Math.floor(sessionDuration.asHours());
  const remainingMinutes = sessionDuration.minutes();
  if (hours === 0) return `${remainingMinutes} menit`;
  return remainingMinutes === 0
    ? `${hours} jam`
    : `${hours} jam ${remainingMinutes} menit`;
}

function getLocationHref(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default function ChapterItemAILN(props: ChapterItemAILNProps) {
  const [tasks, setTasks] = useState<ChapterLearnings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { chapter } = props;
  const sessionDate = dayjs.utc(chapter.session_date).tz("Asia/Jakarta");
  const locationHref = getLocationHref(chapter.location_url);

  useEffect(() => {
    if (!props.expanded) return;
    let cancelled = false;

    const fetchTasks = (silent: boolean) => {
      if (!silent) setIsLoading(true);
      fetch(`/api/learnings?chapter_id=${props.chapter.id}`)
        .then((res) => (res.ok ? (res.json() as Promise<ChapterLearnings>) : null))
        .then((data) => {
          if (!cancelled && data) setTasks(data);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    };

    if (!tasks) fetchTasks(false);

    // Refetch silently on tab-focus/back-nav so completion shows up without a manual refresh.
    const refetchSilently = () => {
      if (document.visibilityState !== "hidden") fetchTasks(true);
    };
    document.addEventListener("visibilitychange", refetchSilently);
    window.addEventListener("popstate", refetchSilently);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", refetchSilently);
      window.removeEventListener("popstate", refetchSilently);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.expanded, props.chapter.id]);

  return (
    <div id={`chapter-${chapter.id}`} className="border-b border-dashboard-border last:border-b-0">
      <button
        type="button"
        aria-expanded={props.expanded}
        aria-controls={`chapter-tasks-${chapter.id}`}
        onClick={props.onToggle}
        className="flex w-full items-start gap-3 px-5 pb-2 pt-5 text-left transition-colors hover:bg-card-2/70 sm:gap-4 sm:px-6"
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-headline text-base font-medium ${
          chapter.progress === "completed"
            ? "bg-hijau-t text-claude dark:bg-claude/20 dark:text-lime-bright"
            : props.unlocked
              ? "bg-claude text-white"
              : "bg-card-2 text-gray-400"
        }`}>
          {chapter.progress === "completed" ? (
            <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
          ) : props.unlocked ? (
            String(props.chapterNumber).padStart(2, "0")
          ) : (
            <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Sesi {String(props.chapterNumber).padStart(2, "0")}
          </span>
          <span className="mt-0.5 block font-headline text-base font-medium text-gray-900 dark:text-white sm:text-lg">
            {chapter.name}
          </span>
          {chapter.description && (
            <span className="mt-1 block text-sm leading-5 text-gray-500 dark:text-gray-400">
              {chapter.description}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {props.unlocked ? (
            <GeneralLabelAILN variant={progressMeta[chapter.progress].variant}>
              {progressMeta[chapter.progress].label}
            </GeneralLabelAILN>
          ) : (
            <GeneralLabelAILN variant="white">Terkunci</GeneralLabelAILN>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${props.expanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </span>
      </button>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 pb-5 text-xs text-gray-600 dark:text-gray-300 sm:pl-[5.25rem] sm:pr-6">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-claude dark:text-lime-bright" aria-hidden="true" />
          <span className="sr-only">Jadwal sesi: </span>
          {sessionDate.isValid()
            ? `${sessionDate.locale("id").format("dddd, D MMMM YYYY · HH:mm")} WIB`
            : "Belum dijadwalkan"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          {chapter.method === "online" ? (
            <Monitor className="h-3.5 w-3.5 text-claude dark:text-lime-bright" aria-hidden="true" />
          ) : (
            <UsersRound className="h-3.5 w-3.5 text-claude dark:text-lime-bright" aria-hidden="true" />
          )}
          <span className="sr-only">Metode: </span>
          {chapter.method === "online" ? "Online" : "Tatap muka"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-claude dark:text-lime-bright" aria-hidden="true" />
          <span className="sr-only">Durasi: </span>
          {formatSessionDuration(chapter.duration_minutes)}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-claude dark:text-lime-bright" aria-hidden="true" />
          <span className="sr-only">Lokasi: </span>
          <span className="break-words">{chapter.location_name?.trim() || "Belum tersedia"}</span>
        </span>
        {locationHref && (
          <a
            href={locationHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-claude underline underline-offset-2 hover:opacity-80 dark:text-lime-bright"
          >
            Buka tautan lokasi
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
        <div
          id={`chapter-tasks-${chapter.id}`}
          className={`grid transition-all duration-300 ease-in-out ${
            props.expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {isLoading && !tasks && <ChapterTasksSkeleton />}
            {tasks &&
              (() => {
                const preTest = tasks.pre_test ?? null;
                const postTest = tasks.post_test ?? null;
                const survey = tasks.survey ?? null;
                // A pre-test only measures something if it comes before the chapter's content.
                const preTestDone = !preTest || preTest.submitted;
                const contentUnlocked = props.unlocked && preTestDone;
                const contentLockedMessage =
                  props.unlocked && !preTestDone
                    ? CHAPTER_TEST_LOCKED_MESSAGE.pre_test_required
                    : undefined;
                const allMaterialsRead = tasks.materials.every(
                  (m) => m.completed
                );
                const quizUnlocked = contentUnlocked && allMaterialsRead;
                const preTestUnlocked = props.unlocked && !!preTest?.available;
                const postTestUnlocked =
                  props.unlocked && !!postTest?.available;
                const surveyUnlocked = props.unlocked && !!survey?.available;
                // The single "continue here" task in this chapter — first unlocked + unfinished
                // item, scanning pre-test → materials → video → quiz → post-test → survey.
                let nextKey: string | null = null;
                if (props.unlocked) {
                  if (preTest && !preTest.submitted && preTestUnlocked) {
                    nextKey = "pre";
                  } else if (contentUnlocked) {
                    const firstMat = tasks.materials.find((m) => !m.completed);
                    const firstVid = tasks.videos.find((v) => !v.completed);
                    const firstQuiz = quizUnlocked
                      ? tasks.quizzes.find((q) => q.attempts === 0)
                      : undefined;
                    if (firstMat) nextKey = `m-${firstMat.id}`;
                    else if (firstVid) nextKey = `v-${firstVid.id}`;
                    else if (firstQuiz) nextKey = `q-${firstQuiz.id}`;
                    else if (postTest && !postTest.submitted && postTestUnlocked)
                      nextKey = "post";
                    else if (survey && !survey.submitted && surveyUnlocked)
                      nextKey = "survey";
                  }
                }
                return (
                  <div className="space-y-2 border-t border-dashboard-border bg-card-2/60 px-5 py-4 sm:px-6">
                    {preTest && (
                      <ChapterTaskItemAILN
                        variant="PreTest"
                        test={preTest}
                        unlocked={preTestUnlocked}
                        isNext={nextKey === "pre"}
                        lockedMessage={
                          preTest.locked_reason
                            ? CHAPTER_TEST_LOCKED_MESSAGE[preTest.locked_reason]
                            : undefined
                        }
                      />
                    )}
                    {tasks.materials.map((m) => (
                      <ChapterTaskItemAILN
                        key={`m-${m.id}`}
                        variant="Material"
                        material={m}
                        unlocked={contentUnlocked}
                        isNext={nextKey === `m-${m.id}`}
                        lockedMessage={contentLockedMessage}
                      />
                    ))}
                    {tasks.videos.map((v) => (
                      <ChapterTaskItemAILN
                        key={`v-${v.id}`}
                        variant="Video"
                        video={v}
                        unlocked={contentUnlocked}
                        isNext={nextKey === `v-${v.id}`}
                        lockedMessage={contentLockedMessage}
                      />
                    ))}
                    {tasks.quizzes.map((q) => (
                      <ChapterTaskItemAILN
                        key={`q-${q.id}`}
                        variant="Quiz"
                        quiz={q}
                        unlocked={quizUnlocked}
                        isNext={nextKey === `q-${q.id}`}
                        lockedMessage={
                          contentLockedMessage ??
                          (props.unlocked && !allMaterialsRead
                            ? "Baca semua materi, sebelum memulai quiz"
                            : undefined)
                        }
                      />
                    ))}
                    {postTest && (
                      <ChapterTaskItemAILN
                        variant="PostTest"
                        test={postTest}
                        unlocked={postTestUnlocked}
                        isNext={nextKey === "post"}
                        lockedMessage={
                          postTest.locked_reason
                            ? CHAPTER_TEST_LOCKED_MESSAGE[postTest.locked_reason]
                            : undefined
                        }
                      />
                    )}
                    {survey && (
                      <ChapterTaskItemAILN
                        variant="Survey"
                        survey={{
                          chapterId: props.chapter.id,
                          submitted: survey.submitted,
                        }}
                        unlocked={surveyUnlocked || (props.unlocked && survey.submitted)}
                        isNext={nextKey === "survey"}
                        lockedMessage="Dibuka setelah sesi chapter dimulai"
                      />
                    )}
                  </div>
                );
              })()}
          </div>
        </div>
    </div>
  );
}
function ChapterTasksSkeleton() {
  return (
    <div className="space-y-2 border-t border-dashboard-border px-4 py-3 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-dashboard-border bg-card-2 p-3"
        >
          <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200 dark:bg-dashboard-border" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-16 rounded-lg bg-gray-100 dark:bg-dashboard-border" />
            <div className="h-3.5 w-48 rounded-lg bg-gray-200 dark:bg-dashboard-border" />
          </div>
          <div className="h-8 w-32 shrink-0 rounded-lg bg-gray-200 dark:bg-dashboard-border" />
          <div className="h-4 w-4 shrink-0 rounded-full bg-gray-200 dark:bg-dashboard-border" />
        </div>
      ))}
    </div>
  );
}
