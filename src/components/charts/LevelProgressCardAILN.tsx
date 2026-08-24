"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import { getLevelProgressMock } from "@/mock-data/student";
import { Star } from "lucide-react";

interface LevelProgressCardAILNProps {
  className?: string;
}

export default function LevelProgressCardAILN(
  props: LevelProgressCardAILNProps
) {
  const { levels, current_level_number, tasks_required, tasks_done } =
    getLevelProgressMock();
  const target = Math.max(tasks_required, 1);
  const pct = Math.min(100, Math.round((tasks_done / target) * 100));
  const content = (
    <>
      <LevelStepper
        levels={levels}
        currentLevelNumber={current_level_number}
        tasksRequired={tasks_required}
        tasksDone={tasks_done}
      />
      <div className="mt-5 rounded-lg border border-gray-200 p-3 dark:border-dashboard-border">
        <div className="mb-2 text-xs text-gray-700 dark:text-gray-300">
          Progress di Level {current_level_number}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
            <div
              className="h-full rounded-full bg-red-500 dark:shadow-[0_0_8px_rgba(239,68,68,0.7)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {tasks_done} / {tasks_required}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <SectionContainerAILN
      title="Level Progress"
      desc="Pantau perkembangan level belajar kamu."
    >
      <StatShell className={props.className}>{content}</StatShell>
    </SectionContainerAILN>
  );
}

function LevelStepper({
  levels,
  currentLevelNumber,
  tasksRequired,
  tasksDone,
}: {
  levels: {
    id: number;
    level_number: number;
    name: string;
    icon: string | null;
  }[];
  currentLevelNumber: number;
  tasksRequired: number;
  tasksDone: number;
}) {
  if (levels.length === 0) return null;
  return (
    <div className="mt-6 flex items-start">
      {levels.map((lvl, idx) => {
        const isPast = lvl.level_number < currentLevelNumber;
        const isCurrent = lvl.level_number === currentLevelNumber;
        const isFuture = lvl.level_number > currentLevelNumber;

        const leftReached = idx > 0 && lvl.level_number <= currentLevelNumber;
        const rightReached =
          idx < levels.length - 1 &&
          levels[idx + 1].level_number <= currentLevelNumber;

        return (
          <div key={lvl.id} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-10 w-full items-center justify-center">
              {idx > 0 && (
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1/2 ${
                    leftReached
                      ? "h-0.5 bg-red-500 dark:shadow-[0_0_4px_rgba(239,68,68,0.7)]"
                      : "border-t-2 border-dashed border-gray-300 dark:border-dashboard-border"
                  }`}
                />
              )}
              {idx < levels.length - 1 && (
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-1/2 ${
                    rightReached
                      ? "h-0.5 bg-red-500 dark:shadow-[0_0_4px_rgba(239,68,68,0.7)]"
                      : "border-t-2 border-dashed border-gray-300 dark:border-dashboard-border"
                  }`}
                />
              )}
              <LevelCircle
                state={isPast ? "past" : isCurrent ? "current" : "future"}
              />
            </div>

            <div
              className={`text-xs font-bold uppercase tracking-wider ${
                isCurrent
                  ? "text-red-500 dark:text-red-400"
                  : isFuture
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-800 dark:text-gray-200"
              }`}
            >
              Level {lvl.level_number}
            </div>

            <LevelBadge
              state={isPast ? "past" : isCurrent ? "current" : "future"}
              done={isPast ? tasksRequired : isCurrent ? tasksDone : 0}
              total={tasksRequired}
            />
          </div>
        );
      })}
    </div>
  );
}

function LevelCircle({ state }: { state: "past" | "current" | "future" }) {
  if (state === "past") {
    return (
      <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-red-500 dark:shadow-[0_0_10px_rgba(239,68,68,0.6)]">
        <Star className="size-4 fill-white text-white" />
      </div>
    );
  }
  if (state === "current") {
    return (
      <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-red-500 shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#ef4444] dark:shadow-[0_0_0_2px_#0a0a0a,0_0_0_4px_#ef4444,0_0_12px_rgba(239,68,68,0.6)]">
        <Star className="size-4 fill-white text-white" />
      </div>
    );
  }
  return (
    <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-gray-300 dark:bg-dashboard-border">
      <Star className="size-4 fill-white text-white" />
    </div>
  );
}

function LevelBadge({
  state,
  done,
  total,
}: {
  state: "past" | "current" | "future";
  done: number;
  total: number;
}) {
  if (state === "past") {
    return <GeneralLabelAILN variant="green">Selesai</GeneralLabelAILN>;
  }
  if (state === "current") {
    return (
      <GeneralLabelAILN variant="red">
        {done} / {total}
      </GeneralLabelAILN>
    );
  }
  return (
    <GeneralLabelAILN variant="white">
      {done} / {total}
    </GeneralLabelAILN>
  );
}

function StatShell({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`flex h-full flex-col ${className}`}>{children}</div>;
}
