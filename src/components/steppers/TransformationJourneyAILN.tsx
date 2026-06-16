"use client";
import { ArrowUp } from "lucide-react";
import { Fragment } from "react";

// Fixed program phases. The active phase is derived from the current week so
// the "(saat ini)" caption always lands on the right stage.
const STAGES = [
  { key: "prep", label: "Persiapan", sub: "Minggu 0" },
  { key: "first_win", label: "First Win", sub: "Minggu 1-2" },
  { key: "active_loop", label: "Active Loop", sub: "Minggu 3+" },
  { key: "hasil", label: "Hasil", sub: "Per kuartal" },
];

function currentStageIndex(week: number, totalWeeks: number): number {
  if (week <= 0) return 0;
  if (week <= 2) return 1;
  if (week < totalWeeks) return 2;
  return 3;
}

/**
 * Horizontal program-journey stepper for the Sponsor dashboard. Completed
 * phases read green (check / up-arrow), the current phase is an amber ring, and
 * upcoming phases are muted.
 */
export default function TransformationJourneyAILN({
  currentWeek,
  totalWeeks,
}: {
  currentWeek: number;
  totalWeeks: number;
}) {
  const activeIndex = currentStageIndex(currentWeek, totalWeeks);

  return (
    <section className="ailn-card border bg-card-1 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Perjalanan Transformasi
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          Minggu ke-{currentWeek} dari {totalWeeks}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {STAGES.map((stage, i) => {
          const state =
            i < activeIndex
              ? "done"
              : i === activeIndex
                ? "active"
                : "upcoming";
          return (
            <Fragment key={stage.key}>
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 rounded-full ${
                    i < activeIndex
                      ? "bg-emerald-400"
                      : i === activeIndex
                        ? "bg-amber-300"
                        : "bg-gray-200 dark:bg-dashboard-border"
                  }`}
                />
              )}
              <div className="flex shrink-0 items-center gap-2.5">
                <StageCircle state={state} />
                <div className="flex flex-col leading-tight">
                  <span
                    className={`text-sm font-bold ${
                      state === "upcoming"
                        ? "text-muted-foreground"
                        : state === "active"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stage.sub}
                    {state === "active" && (
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {" "}
                        (saat ini)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

function StageCircle({ state }: { state: "done" | "active" | "upcoming" }) {
  if (state === "done") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
        <ArrowUp size={14} strokeWidth={2.5} />
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-amber-400">
        <span className="size-2.5 rounded-full bg-amber-400" />
      </div>
    );
  }
  return (
    <div className="size-7 shrink-0 rounded-full border-2 border-gray-200 dark:border-dashboard-border" />
  );
}
