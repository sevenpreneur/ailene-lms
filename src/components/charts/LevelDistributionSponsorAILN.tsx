"use client";
import type React from "react";
import { trpc } from "@/trpc/client";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Level = {
  id: number | string;
  code: string;
  label?: string | null;
  name: string;
  count: number;
  percent: number;
};

const chartConfig = {
  count: { label: "Staff" },
} satisfies ChartConfig;

export default function LevelDistributionSponsorAILN() {
  const q = trpc.read.levelDistribution.useQuery();

  if (q.isLoading) {
    return (
      <Shell>
        <div className="h-48 animate-pulse rounded-md bg-muted" />
      </Shell>
    );
  }

  if (q.error || !q.data) {
    return (
      <Shell>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Gagal memuat distribusi level.
        </div>
      </Shell>
    );
  }

  const levels = q.data.levels as Level[];
  const total = levels.reduce((acc, l) => acc + l.count, 0);

  // Segment color follows the maturity ramp (globals.css --ailn-level-N) by index.
  const chartData = levels.map((level, i) => ({
    code: level.code,
    label: level.label ?? level.code,
    name: level.name,
    count: level.count,
    percent: level.percent,
    fill: `var(--ailn-level-${(i % 5) + 1})`,
  }));

  return (
    <Shell>
      <div className="text-base font-bold text-foreground">
        Distribusi Level Organisasi
      </div>

      <div className="mt-2 flex flex-col items-center gap-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-square h-[210px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="label" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              innerRadius={60}
              outerRadius={95}
              strokeWidth={3}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 8}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString("id-ID")}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 14}
                          className="fill-muted-foreground text-xs"
                        >
                          total staff
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className="w-full space-y-2">
          {chartData.map((d) => (
            <li
              key={d.code}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: d.fill }}
                />
                <span className="font-semibold text-foreground">{d.label}</span>
                <span className="truncate text-muted-foreground">{d.name}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums text-foreground">
                {d.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="ailn-card p-5">{children}</div>;
}
