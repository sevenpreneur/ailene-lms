"use client";
import { trpc } from "@/trpc/client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { BAR_DEEP, BAR_SOFT, LINE_ADOPTION } from "./sponsor-palette";
import { SAMPLE_PROFICIENCY } from "./sample-proficiency-data";

// Avg level is the hero series (emerald line); % Level 1+ is the supporting
// bar series. Two y-axes so the 0..4 level scale and 0..100 % scale coexist.
const LEVEL_LINE = LINE_ADOPTION;

// Preview toggle: when true the chart always shows the rising dummy curve
// (with a "data contoh" badge). Set to false to use real reconstructed data.
const FORCE_SAMPLE_DATA = true;

const chartConfig = {
  avg_level: { label: "Rata-rata Level", color: LEVEL_LINE },
  level1_plus_percent: { label: "% Level 1+", color: BAR_DEEP },
} satisfies ChartConfig;

type ProficiencyWeek = {
  label: string;
  avg_level: number;
  level1_plus_percent: number;
  highlight?: boolean;
};

// Use real data when there's any proficiency signal; otherwise fall back to
// local sample data (keeping the real week labels) so the chart isn't barren
// in empty/seed-less environments.
function resolveWeeks(realWeeks: ProficiencyWeek[]): {
  weeks: ProficiencyWeek[];
  isSample: boolean;
} {
  const hasSignal =
    !FORCE_SAMPLE_DATA &&
    realWeeks.some((w) => w.avg_level > 0 || w.level1_plus_percent > 0);
  if (hasSignal) return { weeks: realWeeks, isSample: false };

  const base =
    realWeeks.length === SAMPLE_PROFICIENCY.length
      ? realWeeks
      : SAMPLE_PROFICIENCY;
  const weeks = base.map((w, i) => ({
    label: w.label,
    avg_level: SAMPLE_PROFICIENCY[i].avg_level,
    level1_plus_percent: SAMPLE_PROFICIENCY[i].level1_plus_percent,
    highlight: i === base.length - 1,
  }));
  return { weeks, isSample: true };
}

export default function ProficiencyTrendsSponsorAILN() {
  const q = trpc.ailene.read.proficiencyTrends.useQuery();

  const legend = (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-0.5 w-3 rounded-full"
          style={{ backgroundColor: LEVEL_LINE }}
        />
        Rata-rata Level
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: BAR_DEEP }}
        />
        % Level 1+
      </span>
    </div>
  );

  if (q.isLoading) {
    return (
      <SectionContainerAILN
        className="h-full"
        title="Perkembangan Kemampuan Tim"
        desc="Rata-rata level tim & porsi yang sudah Level 1+ · 12 minggu terakhir"
        headerRight={legend}
      >
        <div className="h-72 animate-pulse rounded-md bg-muted" />
      </SectionContainerAILN>
    );
  }

  if (q.error || !q.data) {
    return (
      <SectionContainerAILN
        className="h-full"
        title="Perkembangan Kemampuan Tim"
        desc="Rata-rata level tim & porsi yang sudah Level 1+ · 12 minggu terakhir"
        headerRight={legend}
      >
        <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
          Gagal memuat tren penguasaan.
        </div>
      </SectionContainerAILN>
    );
  }

  const { weeks, isSample } = resolveWeeks(q.data.weeks);

  return (
    <SectionContainerAILN
      className="h-full"
      title="Perkembangan Kemampuan Tim"
      desc="Rata-rata level tim & porsi yang sudah Level 1+ · 12 minggu terakhir"
      headerRight={
        <div className="flex items-center gap-3">
          {isSample && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              data contoh
            </span>
          )}
          {legend}
        </div>
      }
    >
      <div className="min-h-[240px]">
        <TrendChart data={weeks} />
      </div>
    </SectionContainerAILN>
  );
}

function TrendChart({ data }: { data: ProficiencyWeek[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
        Belum ada data penguasaan.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        barCategoryGap="22%"
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          fontSize={11}
        />
        {/* Bars: % Level 1+ (0..100) */}
        <YAxis yAxisId="pct" domain={[0, 100]} hide />
        {/* Line: avg level (0..4) */}
        <YAxis yAxisId="level" domain={[0, 4]} hide />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              labelKey="label"
              formatter={(value, name) => {
                const isLevel = name === "avg_level";
                const color = isLevel ? LEVEL_LINE : BAR_DEEP;
                const text = isLevel
                  ? `${Number(value).toLocaleString("id-ID", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })} / 4`
                  : `${Number(value).toLocaleString("id-ID")}%`;
                return (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                      {isLevel ? (
                        <span
                          className="inline-block h-[3px] w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ) : (
                        <span
                          className="size-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      <span className="text-muted-foreground">
                        {isLevel ? "Rata-rata Level" : "% Level 1+"}
                      </span>
                    </span>
                    <span className=" font-medium tabular-nums text-foreground">
                      {text}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Bar
          yAxisId="pct"
          dataKey="level1_plus_percent"
          radius={[5, 5, 0, 0]}
          minPointSize={(value) => ((value ?? 0) > 0 ? 3 : 0)}
        >
          {data.map((d, i) => (
            <Cell
              key={d.label}
              fill={d.highlight ?? i === data.length - 1 ? BAR_DEEP : BAR_SOFT}
            />
          ))}
        </Bar>
        <Line
          yAxisId="level"
          dataKey="avg_level"
          type="monotone"
          stroke={LEVEL_LINE}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
