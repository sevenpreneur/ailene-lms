/**
 * Ranked use-case row for the group detail "Top use case" list: rank, name +
 * level, a share bar, and the submission count.
 */
export default function GroupUseCaseRowAILN({
  rank,
  name,
  level,
  count,
  percent,
}: {
  rank: number;
  name: string;
  level: string;
  count: number;
  percent: number;
}) {
  return (
    <div className="grid grid-cols-[2rem_minmax(8rem,12rem)_1fr_3rem] items-center gap-3">
      <span className="text-xs text-gray-400">#{rank}</span>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {name}
        </div>
        <div className="truncate text-[11px] text-gray-500 dark:text-gray-400">
          {level}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
        <div
          className="h-full rounded-full bg-gray-900 dark:bg-gray-100"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <span className="text-right text-xs font-bold text-gray-900 dark:text-white">
        {count}x
      </span>
    </div>
  );
}
