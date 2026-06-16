// Monochrome green maturity ramp (L0 light → L4 deep brand green) specific to
// the per-group stacked distribution — distinct from the multi-hue org ramp.
const GREEN_RAMP = ["#e7f4ef", "#b9ddcf", "#73b99e", "#29916f", "#006b50"];

function levelColor(index: number) {
  return GREEN_RAMP[index] ?? GREEN_RAMP[GREEN_RAMP.length - 1];
}

/**
 * Per-group level distribution: a 100%-stacked bar + legend (left) alongside a
 * per-level horizontal bar list (right). Green maturity ramp, L0 → L4.
 */
export default function GroupLevelDistributionAILN({
  levels,
}: {
  levels: {
    id: number;
    code: string;
    name: string;
    count: number;
    percent: number;
  }[];
}) {
  const total = levels.reduce((sum, level) => sum + level.count, 0);
  const maxCount = Math.max(...levels.map((level) => level.count), 1);
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex h-5 overflow-hidden rounded-sm bg-gray-100 dark:bg-dashboard-border">
          {levels.map((level, index) => (
            <div
              key={level.id}
              className="h-full border-r border-white/50 last:border-r-0 dark:border-black/20"
              style={{
                width:
                  total === 0
                    ? `${100 / Math.max(levels.length, 1)}%`
                    : `${Math.max(level.percent, level.count > 0 ? 4 : 1)}%`,
                backgroundColor: levelColor(index),
              }}
              title={`${level.code}: ${level.count} anggota (${level.percent}%)`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {levels.map((level, index) => (
            <div key={level.id} className="flex items-start gap-2">
              <span
                className="mt-1 inline-block size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: levelColor(index) }}
              />
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {level.code} {level.count}
                </div>
                <div className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                  {level.name} - {level.percent}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {levels.map((level, index) => (
          <div
            key={level.id}
            className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2 text-xs"
          >
            <span className="font-bold text-gray-700 dark:text-gray-200">
              {level.code}
            </span>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max((level.count / maxCount) * 100, level.count > 0 ? 6 : 1)}%`,
                  backgroundColor: levelColor(index),
                }}
              />
            </div>
            <span className="text-right font-semibold text-gray-900 dark:text-white">
              {level.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
