import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  levelColorByCode,
  levelTextColorByCode,
} from "@/lib/level-colors";
import Link from "next/link";

/**
 * One department row in the org level-distribution list: a 100%-stacked level
 * bar (each segment tooltip-annotated) linking to the group detail. Supports a
 * dimmed / flagged state for the "highlight underperform" toggle.
 */
export default function DepartmentDistributionRowAILN({
  group,
  levelNameByCode,
  isUnderperform = false,
  dimmed = false,
  showFlag = false,
}: {
  group: {
    id: number;
    name: string;
    total: number;
    levels: {
      level_id: number;
      code: string;
      label?: string;
      count: number;
    }[];
  };
  levelNameByCode: Map<string, string>;
  isUnderperform?: boolean;
  dimmed?: boolean;
  showFlag?: boolean;
}) {
  return (
    <Link
      href={`/sponsor/groups/${group.id}`}
      className={`grid grid-cols-[minmax(7rem,10rem)_minmax(0,1fr)_3.5rem] items-center gap-3 rounded-md px-2 py-1 text-sm transition hover:bg-muted dark:hover:bg-card-2 ${
        dimmed ? "opacity-40" : ""
      } ${
        showFlag && isUnderperform
          ? "bg-amber-50 ring-1 ring-amber-300 dark:bg-amber-500/10 dark:ring-amber-500/40"
          : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate font-medium text-muted-foreground dark:text-gray-200">
          {group.name}
        </span>
        {showFlag && isUnderperform && (
          <span className="shrink-0 rounded-sm bg-amber-200 px-1 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
            ⚠
          </span>
        )}
      </div>
      {/* 100% stacked bar — each segment's width = that level's share of the dept */}
      <TooltipProvider delayDuration={80}>
        <div className="flex h-7 w-full overflow-hidden rounded-sm bg-muted">
          {group.levels.map((level) => {
            const pct = group.total > 0 ? (level.count / group.total) * 100 : 0;
            if (pct <= 0) return null;
            const name = levelNameByCode.get(level.code);
            return (
              <Tooltip key={level.level_id}>
                <TooltipTrigger asChild>
                  <div
                    className="flex cursor-pointer items-center justify-center px-1 text-[11px] font-bold transition-opacity hover:opacity-90"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: levelColorByCode(level.code),
                      color: levelTextColorByCode(level.code),
                    }}
                  >
                    {pct >= 12 && (
                      <span className="truncate">{Math.round(pct)}%</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="border border-dashboard-border bg-popover text-popover-foreground shadow-md">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">
                      {level.label ?? level.code}
                      {name ? ` · ${name}` : ""}
                    </span>
                    <span className="text-muted-foreground">
                      {level.count.toLocaleString("id-ID")} orang ·{" "}
                      {Math.round(pct)}%
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      <div className="text-right text-xs font-semibold text-muted-foreground dark:text-gray-200">
        {group.total} org
      </div>
    </Link>
  );
}
