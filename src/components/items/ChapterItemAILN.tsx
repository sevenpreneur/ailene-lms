"use client";
import ChapterTaskItemAILN from "@/components/items/ChapterTaskItemAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import type { ChapterLearnings } from "@/apis/learnings";
import { CHAPTER_TEST_LOCKED_MESSAGE } from "@/lib/chapter-evaluation";
import { faCheck, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type ChapterProgress = "not_started" | "in_progress" | "completed";

interface Chapter {
  id: number;
  name: string;
  description: string | null;
  progress: ChapterProgress;
}

const progressMeta: Record<
  ChapterProgress,
  { label: string; variant: GeneralLabelVariantAILN }
> = {
  not_started: { label: "Not Started", variant: "white" },
  in_progress: { label: "In Progress", variant: "blue" },
  completed: { label: "Completed", variant: "green" },
};

interface ChapterItemAILNProps {
  chapter: Chapter;
  chapterNumber: number;
  unlocked: boolean;
  expanded: boolean;
  onToggle: () => void;
}

export default function ChapterItemAILN(props: ChapterItemAILNProps) {
  const [tasks, setTasks] = useState<ChapterLearnings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="relative pl-12">
      <div
        className={`absolute left-1 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          props.chapter.progress === "completed"
            ? "border-emerald-500 bg-white text-emerald-500 dark:bg-black"
            : props.unlocked
            ? "border-claude bg-white text-claude dark:bg-black"
            : "border-gray-300 bg-gray-100 text-gray-400 dark:border-claude/30 dark:bg-black dark:text-claude/40"
        }`}
      >
        {props.chapter.progress === "completed" ? (
          <FontAwesomeIcon icon={faCheck} size="xs" />
        ) : props.unlocked ? (
          <span className="h-1.5 w-1.5 rounded-full bg-lime-bright" />
        ) : (
          <FontAwesomeIcon icon={faLock} size="xs" />
        )}
      </div>

      <div
        className={`rounded-lg bg-card-1 border border-dashboard-border ${
          !props.unlocked ? "opacity-60 dark:opacity-50" : ""
        }`}
      >
        <button
          type="button"
          onClick={props.onToggle}
          className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <div className="text-xs tracking-widest uppercase text-emphasis dark:text-gray-400">
              Chapter {props.chapterNumber}
            </div>
            <div className="text-lg font-medium dark:text-white">
              {props.chapter.name}
            </div>
            {props.chapter.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {props.chapter.description}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {props.unlocked ? (
              <GeneralLabelAILN
                variant={progressMeta[props.chapter.progress].variant}
              >
                {progressMeta[props.chapter.progress].label}
              </GeneralLabelAILN>
            ) : (
              <GeneralLabelAILN variant="white">Locked</GeneralLabelAILN>
            )}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 dark:text-lime-bright/70 ${
                props.expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        <div
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
                  <div className="space-y-2 border-t border-dashboard-border px-4 py-3">
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

export function ChapterItemSkeleton() {
  return (
    <div className="relative pl-12 animate-pulse">
      <div className="absolute top-4 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 dark:border-dashboard-border dark:bg-card-1" />
      <div className="rounded-lg bg-card-1 border border-dashboard-border">
        <div className="flex w-full items-center justify-between gap-4 p-4">
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-24 rounded-lg bg-gray-100 dark:bg-dashboard-border" />
            <div className="h-4 w-64 rounded-lg bg-gray-300 dark:bg-gray-700" />
            <div className="h-3 w-80 rounded-lg bg-gray-200 dark:bg-dashboard-border" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 rounded-lg bg-gray-200 dark:bg-dashboard-border" />
            <div className="h-4 w-4 rounded-lg bg-gray-200 dark:bg-dashboard-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
