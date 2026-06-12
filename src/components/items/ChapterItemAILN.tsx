"use client";
import ChapterTaskItemAILN from "@/components/items/ChapterTaskItemAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import { trpc } from "@/trpc/client";
import type { ChapterProgress } from "@/trpc/routers/ailene/utils.ailene";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronDown } from "lucide-react";
import AppErrorComponents from "../states/AppErrorComponents";

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
  const tasksQ = trpc.list.tasks.useQuery(
    { chapter_id: props.chapter.id },
    { enabled: props.expanded }
  );

  return (
    <div className="relative pl-12">
      <div
        className={`absolute top-4 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
          props.unlocked
            ? "border-red-500 bg-white text-red-500 dark:bg-black"
            : "border-gray-300 bg-gray-100 text-gray-400 dark:border-red-500/30 dark:bg-black dark:text-red-500/40"
        }`}
      >
        {props.unlocked ? (
          <span className="h-2 w-2 rounded-full bg-red-500" />
        ) : (
          <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
        )}
      </div>

      <div
        className={`rounded-xl bg-card-1 border border-dashboard-border ${
          !props.unlocked ? "opacity-60 dark:opacity-50" : ""
        }`}
      >
        <button
          type="button"
          onClick={props.onToggle}
          className="flex w-full items-center justify-between gap-4 p-4 text-left"
        >
          <div className="flex-1">
            <div className="text-xs tracking-widest uppercase text-emphasis dark:text-gray-400">
              Chapter {props.chapterNumber}
            </div>
            <div className="text-lg font-bold dark:text-white">
              {props.chapter.name}
            </div>
            {props.chapter.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {props.chapter.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
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
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 dark:text-red-300/70 ${
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
            {tasksQ.isLoading && (
              <div className="space-y-2 border-t border-dashboard-border px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <TaskItemSkeleton key={i} />
                ))}
              </div>
            )}
            {(tasksQ.error || (!tasksQ.isLoading && !tasksQ.data)) && (
              <AppErrorComponents />
            )}
            {tasksQ.data &&
              (() => {
                const allMaterialsRead = tasksQ.data.materials.every(
                  (m) => m.completed
                );
                const quizUnlocked = props.unlocked && allMaterialsRead;
                // The single "continue here" task in this chapter — first
                // unlocked + unfinished item, scanning materials → quiz → video.
                let nextKey: string | null = null;
                if (props.unlocked) {
                  const firstMat = tasksQ.data.materials.find(
                    (m) => !m.completed
                  );
                  if (firstMat) {
                    nextKey = `m-${firstMat.id}`;
                  } else {
                    const firstQuiz = quizUnlocked
                      ? tasksQ.data.quizzes.find((q) => q.attempts === 0)
                      : undefined;
                    if (firstQuiz) {
                      nextKey = `q-${firstQuiz.id}`;
                    } else {
                      const firstVid = tasksQ.data.videos.find(
                        (v) => !v.completed
                      );
                      if (firstVid) nextKey = `v-${firstVid.id}`;
                    }
                  }
                }
                return (
                  <div className="space-y-2 border-t border-dashboard-border px-4 py-3">
                    {tasksQ.data.materials.map((m) => (
                      <ChapterTaskItemAILN
                        key={`m-${m.id}`}
                        variant="Material"
                        material={m}
                        unlocked={props.unlocked}
                        isNext={nextKey === `m-${m.id}`}
                      />
                    ))}
                    {tasksQ.data.quizzes.map((q) => (
                      <ChapterTaskItemAILN
                        key={`q-${q.id}`}
                        variant="Quiz"
                        quiz={q}
                        unlocked={quizUnlocked}
                        isNext={nextKey === `q-${q.id}`}
                        lockedMessage={
                          props.unlocked && !allMaterialsRead
                            ? "Baca semua materi, sebelum memulai quiz"
                            : undefined
                        }
                      />
                    ))}
                    {tasksQ.data.videos.map((v) => (
                      <ChapterTaskItemAILN
                        key={`v-${v.id}`}
                        variant="Video"
                        video={v}
                        unlocked={props.unlocked}
                        isNext={nextKey === `v-${v.id}`}
                      />
                    ))}
                  </div>
                );
              })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChapterItemSkeleton() {
  return (
    <div className="relative pl-12 animate-pulse">
      <div className="absolute top-4 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 dark:border-dashboard-border dark:bg-card-1" />
      <div className="rounded-xl bg-card-1 border border-dashboard-border">
        <div className="flex w-full items-center justify-between gap-4 p-4">
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-24 rounded bg-gray-100 dark:bg-dashboard-border" />
            <div className="h-4 w-64 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-3 w-80 rounded bg-gray-200 dark:bg-dashboard-border" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 rounded bg-gray-200 dark:bg-dashboard-border" />
            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-dashboard-border" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashboard-border bg-card-2 p-3 animate-pulse">
      <div className="h-10 w-10 shrink-0 rounded-md bg-gray-200 dark:bg-dashboard-border" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 w-16 rounded bg-gray-100 dark:bg-dashboard-border" />
        <div className="h-3.5 w-48 rounded bg-gray-300 dark:bg-gray-700" />
        <div className="flex items-center gap-2 pt-0.5">
          <div className="h-4 w-14 rounded-full bg-gray-200 dark:bg-dashboard-border" />
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-dashboard-border" />
        </div>
      </div>
      <div className="h-8 w-32 shrink-0 rounded-md bg-gray-200 dark:bg-dashboard-border" />
      <div className="h-4 w-4 shrink-0 rounded-full bg-gray-200 dark:bg-dashboard-border" />
    </div>
  );
}
