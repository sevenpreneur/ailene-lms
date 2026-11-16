import { formatRelativeTime } from "@/lib/date-time-manipulation";
import { cn } from "@/lib/utils";
import { WORKFLOW_STATUS_LABELS } from "@/lib/workflow-map";
import type { WorkflowListItem } from "@/apis/workflows";
import { ArrowRight, Flame, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function WorkflowMapCardAILN({
  map,
  href,
}: {
  map: WorkflowListItem;
  href: string;
}) {
  const { step_count, total_minutes, pain_count, feedback_count } = map.summary;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-4 rounded-lg border border-dashboard-border bg-card-1 p-4 transition-[border-color,box-shadow] duration-200 hover:border-sevenpreneur-coal/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevenpreneur-coal dark:hover:border-white/40 dark:focus-visible:outline-white sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            map.status === "reviewed"
              ? "bg-sevenpreneur-coal text-white dark:bg-white dark:text-sevenpreneur-coal"
              : "border border-sb-border bg-sb-bg text-sb-text-strong",
          )}
        >
          {WORKFLOW_STATUS_LABELS[map.status]}
        </span>
        <span className="text-xs text-muted-foreground">
          Diubah {formatRelativeTime(map.updated_at)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <h2
          className={cn(
            "text-base font-medium leading-snug",
            !map.title && "italic text-muted-foreground",
          )}
        >
          {map.title || "Tanpa judul"}
        </h2>
        {map.problem && (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {map.problem}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-dashboard-border pt-3 text-xs text-muted-foreground">
        <span>{step_count} langkah</span>
        <span aria-hidden>·</span>
        <span>±{total_minutes} menit</span>
        {pain_count > 0 && (
          <span className="inline-flex items-center gap-1">
            <Flame className="size-3" aria-hidden />
            {pain_count} repot
          </span>
        )}
        {feedback_count > 0 && (
          <span className="inline-flex items-center gap-1 text-foreground">
            <MessageSquare className="size-3" aria-hidden />
            {feedback_count} masukan
          </span>
        )}
        <ArrowRight
          aria-hidden
          className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
