"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { levelColorByCode } from "@/lib/ailene-level-colors";
import { formatInt, formatScore } from "@/lib/ailene-format";
import { Cell, Pie, PieChart } from "recharts";

type Level = { code: string; name: string; count: number; percent: number };

/**
 * Org-wide level composition donut: share of employees per competency level,
 * with the average score in the center. Same ramp as the per-department bars.
 */
export default function LevelCompositionAILN({
  levels,
  total,
}: {
  levels: Level[];
  total: number;
}) {
  const avgScore =
    total === 0
      ? 0
      : levels.reduce(
          (sum, l) => sum + Number(l.code.slice(1)) * l.count,
          0
        ) / total;

  const data = levels.map((l) => ({
    key: l.code,
    label: `${l.code} ${l.name}`,
    value: l.count,
    fill: levelColorByCode(l.code),
  }));

  const config = Object.fromEntries(
    levels.map((l) => [
      l.code,
      { label: l.name, color: levelColorByCode(l.code) },
    ])
  ) as ChartConfig;

  return (
    <SectionContainerAILN
      title="Komposisi Level"
      desc={`% dari ${formatInt(total)} karyawan`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <ChartContainer config={config} className="aspect-square h-52">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    nameKey="label"
                    className="border border-dashboard-border bg-popover text-popover-foreground shadow-md"
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={64}
                outerRadius={92}
                paddingAngle={3}
                cornerRadius={6}
                stroke="var(--card)"
                strokeWidth={4}
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={d.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold leading-none text-foreground">
              {formatScore(avgScore)}
            </span>
            <span className="mt-1 text-[11px] text-muted-foreground">
              rata-rata skor
            </span>
          </div>
        </div>

        {/* Compact legend */}
        <ul className="grid w-full grid-cols-1 gap-2 text-sm">
          {data.map((d, i) => (
            <li key={d.key} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: d.fill }}
              />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {d.label}
              </span>
              <span className="shrink-0 tabular-nums font-semibold text-foreground">
                {formatInt(levels[i].count)}
              </span>
              <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">
                {levels[i].percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SectionContainerAILN>
  );
}
