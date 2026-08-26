"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import type { StudentLevel } from "@/apis/learnings";
import { Star } from "lucide-react";
import { Fragment } from "react";

interface LevelProgressCardAILNProps {
  levels: StudentLevel[];
  currentLevelNumber: number;
  tasksRequired: number;
  tasksDone: number;
  className?: string;
}

export default function LevelProgressCardAILN({
  levels,
  currentLevelNumber,
  tasksRequired,
  tasksDone,
  className,
}: LevelProgressCardAILNProps) {
  const target = Math.max(tasksRequired, 1);
  const pct = Math.min(100, Math.round((tasksDone / target) * 100));
  const content = (
    <>
      <LevelStepper
        levels={levels}
        currentLevelNumber={currentLevelNumber}
        tasksRequired={tasksRequired}
        tasksDone={tasksDone}
      />
      <div className="mt-5 rounded-lg border border-gray-200 p-3 dark:border-dashboard-border">
        <div className="mb-2 text-xs text-gray-700 dark:text-gray-300">
          Progress di Level {currentLevelNumber}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
            <div
              className="h-full rounded-full bg-ailene-logo-start dark:shadow-[0_0_8px_rgba(67,159,77,0.7)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {tasksDone} / {tasksRequired}
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
      <StatShell className={className}>{content}</StatShell>
    </SectionContainerAILN>
  );
}

function LevelStepper({
  levels,
  currentLevelNumber,
  tasksRequired,
  tasksDone,
}: {
  levels: StudentLevel[];
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
        const connectorReached = lvl.level_number <= currentLevelNumber;

        return (
          <Fragment key={lvl.id}>
            {idx > 0 && (
              <div className="flex h-9 flex-1 items-center">
                <div
                  className={`h-0.5 w-full ${
                    connectorReached
                      ? "bg-ailene-logo-start dark:shadow-[0_0_4px_rgba(67,159,77,0.7)]"
                      : "border-t-2 border-dashed border-gray-300 dark:border-dashboard-border"
                  }`}
                />
              </div>
            )}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <LevelCircle
                state={isPast ? "past" : isCurrent ? "current" : "future"}
              />
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCurrent
                    ? "text-ailene-logo-start dark:text-lime-bright"
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
          </Fragment>
        );
      })}
    </div>
  );
}

function LevelCircle({ state }: { state: "past" | "current" | "future" }) {
  if (state === "past") {
    return (
      <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-ailene-logo-start dark:shadow-[0_0_10px_rgba(67,159,77,0.6)]">
        <Star className="size-4 fill-white text-white" />
      </div>
    );
  }
  if (state === "current") {
    return (
      <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-sb-item-active-bg shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#439f4d] dark:shadow-[0_0_0_2px_#0a0a0a,0_0_0_4px_#439f4d,0_0_12px_rgba(67,159,77,0.6)]">
        <Star className="size-4 fill-lime-bright text-lime-bright" />
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
