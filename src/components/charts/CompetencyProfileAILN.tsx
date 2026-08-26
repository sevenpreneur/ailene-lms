"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StudentCompetencyDimension } from "@/apis/student";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

const formatScore = (n: number) =>
  n.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

function barColorClass(score: number) {
  if (score > 0) return "bg-lime-bright";
  return "bg-gray-300 dark:bg-gray-600";
}

const radarChartConfig = {
  score: {
    label: "Skor",
    color: "var(--chart-3)",
  },
  target: {
    label: "Target",
    color: "#94a3b8",
  },
} satisfies ChartConfig;

function targetScoreForDimension(key: string, targetLevelNumber: number) {
  const mainTarget = Math.max(1, Math.min(5, targetLevelNumber + 1));

  if (key === "agentic_capabilities") {
    return Math.max(1, Math.min(5, targetLevelNumber));
  }

  return mainTarget;
}

interface CompetencyProfileAILNProps {
  dimensions: StudentCompetencyDimension[];
  currentLevelNumber: number;
  className?: string;
}

export default function CompetencyProfileAILN({
  dimensions,
  currentLevelNumber,
  className,
}: CompetencyProfileAILNProps) {
  const targetLevelNumber = currentLevelNumber + 1;

  return (
    <SectionContainerAILN
      title="Profil Kompetensi AI"
      desc={<>Radar 6 dimensi adalah diagnosa kompetensi AI</>}
      className={className}
    >
      <div className="flex flex-col gap-4">
        {/* Radar chart */}
        <div className="min-w-0">
          <RadarBlock
            dimensions={dimensions}
            targetLevelNumber={targetLevelNumber}
          />
        </div>

        {/* Bar list */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Diagnosa per Pillar
          </p>
          <div className="grid grid-flow-col grid-rows-3 gap-x-6 gap-y-3">
            {dimensions.map((d) => {
              const pct = Math.max(0, Math.min(100, (d.score / 5) * 100));
              return (
                <div key={d.key}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-foreground dark:text-white">
                      {d.name}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-foreground dark:text-white">
                      {formatScore(d.score)} / 5
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
                    <div
                      className={`h-full rounded-full ${barColorClass(d.score)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionContainerAILN>
  );
}

function RadarBlock({
  dimensions,
  targetLevelNumber,
}: {
  dimensions: Array<{ key: string; name: string; score: number }>;
  targetLevelNumber: number;
}) {
  const chartData = dimensions.map((dimension) => ({
    dimension: dimension.name,
    score: dimension.score,
    target: targetScoreForDimension(dimension.key, targetLevelNumber),
  }));

  return (
    <ChartContainer
      config={radarChartConfig}
      className="aspect-auto h-[280px] w-full"
    >
      <RadarChart
        data={chartData}
        margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
        outerRadius="72%"
      >
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_, payload) => {
                const dimension = payload?.[0]?.payload?.dimension;
                return typeof dimension === "string" ? dimension : "Kompetensi";
              }}
              formatter={(value, name) => (
                <div className="flex min-w-28 items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {String(name).toLowerCase().includes("target")
                      ? "Target"
                      : "Skor"}
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatScore(Number(value))} / 5
                  </span>
                </div>
              )}
            />
          }
        />
        <PolarGrid
          gridType="polygon"
          radialLines
          stroke="var(--border)"
          strokeOpacity={0.7}
        />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{
            fill: "var(--muted-foreground)",
            fontSize: 12,
            fontWeight: 500,
          }}
        />
        <PolarRadiusAxis
          angle={90}
          axisLine={false}
          domain={[0, 5]}
          tick={{
            fill: "var(--muted-foreground)",
            fontSize: 10,
          }}
          tickCount={6}
          tickLine={false}
        />
        <Radar
          dataKey="target"
          name={`Target L${targetLevelNumber}`}
          stroke="var(--color-target)"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          fill="var(--color-target)"
          fillOpacity={0}
          dot={false}
        />
        <Radar
          dataKey="score"
          name="Skor"
          stroke="var(--color-score)"
          strokeWidth={2}
          fill="var(--color-score)"
          fillOpacity={0.16}
          dot={{
            r: 4,
            fill: "var(--color-score)",
            stroke: "var(--background)",
            strokeWidth: 2,
          }}
          activeDot={{
            r: 5,
            fill: "var(--color-score)",
            stroke: "var(--background)",
            strokeWidth: 2,
          }}
        />
      </RadarChart>
    </ChartContainer>
  );
}
