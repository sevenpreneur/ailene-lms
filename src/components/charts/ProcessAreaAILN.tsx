"use client";
import {
  PROCESS_CURVE,
  TARGET_LEVEL,
  deriveTarget,
  type LevelDist,
} from "@/components/charts/outcome-target";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import dayjs from "dayjs";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const BRAND_GREEN = "#1f5f4e"; // brand deep green — % reaching target

const processConfig = {
  value: { label: "% capai target", color: BRAND_GREEN },
} satisfies ChartConfig;

/**
 * Process: trend of % employees reaching ≥ TARGET_LEVEL over time. Uses a
 * deterministic sample curve (ending at the current attainment) until a real
 * time-series endpoint exists.
 */
export default function ProcessAreaAILN({
  distribution,
}: {
  distribution: LevelDist;
}) {
  const { currentPct } = deriveTarget(distribution);
  const days = PROCESS_CURVE.length;
  const processData = PROCESS_CURVE.map((f, i) => ({
    date: dayjs()
      .subtract(days - 1 - i, "day")
      .format("D MMM"),
    value: Math.round(f * currentPct),
  }));

  return (
    <div className="flex flex-1 flex-col">
      <ChartContainer
        config={processConfig}
        className="aspect-auto h-56 w-full flex-1"
      >
        <AreaChart
          data={processData}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="proc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={0.25} />
              <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            fontSize={11}
          />
          <YAxis
            width={40}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            domain={[0, (max: number) => Math.max(Math.ceil(max * 1.3), 10)]}
            tickFormatter={(v) => `${v}%`}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--color-dashboard-border)" }}
            content={
              <ChartTooltipContent
                className="border border-dashboard-border bg-popover text-popover-foreground shadow-md"
                labelFormatter={(label) => String(label)}
                formatter={(value) => (
                  <span className="font-medium tabular-nums text-foreground">
                    {Number(value)}% capai ≥ L{TARGET_LEVEL}
                  </span>
                )}
              />
            }
          />
          <Area
            dataKey="value"
            type="monotone"
            stroke={BRAND_GREEN}
            strokeWidth={2}
            fill="url(#proc-fill)"
          />
        </AreaChart>
      </ChartContainer>
      <p className="mt-2 text-xs text-muted-foreground">
        Sumbu Y = % capai ≥ L{TARGET_LEVEL} · 30 hari terakhir · tren ilustratif
      </p>
    </div>
  );
}
