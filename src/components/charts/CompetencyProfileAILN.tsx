"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { trpc } from "@/trpc/client";
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
  if (score >= 3.5) return "bg-emerald-500 dark:bg-emerald-400";
  if (score >= 2.5) return "bg-blue-500 dark:bg-blue-400";
  if (score > 0) return "bg-amber-500 dark:bg-amber-400";
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
  className?: string;
}

export default function CompetencyProfileAILN({
  className,
}: CompetencyProfileAILNProps) {
  const q = trpc.ailene.read.competencyProfile.useQuery();

  if (q.isLoading) {
    return (
      <SectionContainerAILN title="Profil Kompetensi AI" className={className}>
        <div className="h-[360px] animate-pulse rounded-md bg-gray-100 dark:bg-dashboard-border" />
      </SectionContainerAILN>
    );
  }
  if (q.error || !q.data) {
    return (
      <SectionContainerAILN title="Profil Kompetensi AI" className={className}>
        <div className="flex h-[360px] items-center justify-center text-sm text-gray-500">
          Gagal memuat profil kompetensi.
        </div>
      </SectionContainerAILN>
    );
  }

  const { dimensions, target_level_number } = q.data.profile;

  return (
    <SectionContainerAILN
      title="Profil Kompetensi AI"
      desc={<>Radar 6 dimensi adalah diagnosa kompetensi AI</>}
      className={className}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Radar chart */}
        <div className="min-w-0">
          <RadarBlock
            dimensions={dimensions}
            targetLevelNumber={target_level_number}
          />
        </div>

        {/* Bar list */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Diagnosa per Pillar
          </p>
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

      <div className="mt-5 rounded-lg border border-dashed border-dashboard-border bg-muted/30 p-4 text-xs leading-6 text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground dark:text-white">
            Catatan:
          </span>{" "}
          Radar ini membaca 6 pillar kompetensi AI: AI Foundation, Prompting
          Quality, Tool Fluency, Use Case Diversity, AI Habit, dan Agentic
          Capabilities. Skor 0-5 dipakai sebagai diagnosa untuk melihat area
          yang sudah kuat dan area yang perlu dibantu lewat latihan berikutnya.
        </p>
        <p className="mt-2">
          Garis putus-putus menunjukkan target untuk level berikutnya, sehingga
          bentuk radar akan ikut berubah ketika level member naik. Radar ini
          membantu coaching, sedangkan kenaikan level tetap mengikuti gate dan
          aktivitas belajar yang diselesaikan.
        </p>
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
