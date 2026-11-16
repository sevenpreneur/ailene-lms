"use client";

import { GUIDED_FREQUENCIES } from "@/lib/guided-use-case";
import { cn } from "@/lib/utils";
import { WORKFLOW_NODE_LABELS } from "@/lib/workflow-map";
import type { WorkflowNodeInput } from "@/apis/workflows";
import { Flag, Flame, MessageSquare, MousePointerClick } from "lucide-react";

const KIND_ICON = {
  trigger: MousePointerClick,
  step: null,
  output: Flag,
} as const;

export default function WorkflowNodeCardAILN({
  node,
  stepNumber,
  selected,
  feedbackCount,
  onSelect,
}: {
  node: WorkflowNodeInput;
  stepNumber: number | null;
  selected: boolean;
  feedbackCount: number;
  onSelect: () => void;
}) {
  const Icon = KIND_ICON[node.kind];
  const edge = node.kind !== "step";
  const meta =
    node.kind === "trigger"
      ? GUIDED_FREQUENCIES.find((item) => item.value === node.frequency)?.label
      : node.kind === "output"
        ? node.recipient && `Untuk ${node.recipient}`
        : [node.tool, node.minutes ? `±${node.minutes} menit` : null]
            .filter(Boolean)
            .join(" · ");

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group flex w-full max-w-sm flex-col gap-3 rounded-lg border bg-card-1 p-3.5 text-left shadow-xs transition-[border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevenpreneur-coal dark:focus-visible:outline-white",
        selected
          ? "border-sevenpreneur-coal shadow-md ring-1 ring-sevenpreneur-coal dark:border-white dark:ring-white"
          : "border-dashboard-border hover:border-sevenpreneur-coal/40 hover:shadow-sm dark:hover:border-white/40",
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium",
            edge
              ? "bg-sevenpreneur-coal text-white dark:bg-white dark:text-sevenpreneur-coal"
              : "border border-sb-border bg-sb-bg text-sb-text-strong",
          )}
        >
          {Icon ? <Icon className="size-3.5" aria-hidden /> : stepNumber}
        </span>
        <span className="flex-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {WORKFLOW_NODE_LABELS[node.kind]}
        </span>
        {feedbackCount > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-sevenpreneur-coal px-2 py-0.5 text-[11px] font-medium text-white dark:bg-white dark:text-sevenpreneur-coal"
            aria-label={`${feedbackCount} masukan dari kelas`}
          >
            <MessageSquare className="size-3" aria-hidden />
            {feedbackCount}
          </span>
        )}
      </span>

      <span
        className={cn(
          "line-clamp-2 text-sm leading-5",
          node.title ? "text-foreground" : "italic text-muted-foreground",
        )}
      >
        {node.title || "Belum diisi"}
      </span>

      {(meta || node.pain_point) && (
        <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {meta && <span className="truncate">{meta}</span>}
          {node.pain_point && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              <Flame className="size-3" aria-hidden />
              Paling repot
            </span>
          )}
        </span>
      )}
    </button>
  );
}
