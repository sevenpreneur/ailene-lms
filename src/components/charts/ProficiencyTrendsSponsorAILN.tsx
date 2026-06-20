"use client";
import { trpc } from "@/trpc/client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { levelColorByNumber } from "@/lib/level-colors";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

const LEVEL_LINE = levelColorByNumber(3);
const XP_LINE = "#2563eb";

const chartConfig = {
  avg_level: { label: "Rata-rata Level", color: LEVEL_LINE },
  avg_xp: { label: "Rata-rata XP", color: XP_LINE },
} satisfies ChartConfig;

type ProficiencyWeek = {
  label: string;
  avg_level: number;
  avg_xp: number;
  highlight?: boolean;
};

export default function ProficiencyTrendsSponsorAILN() {
  const q = trpc.read.proficiencyTrends.useQuery();

  const legend = (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <LegendLine color={LEVEL_LINE} label="Rata-rata Level" />
      <LegendLine color={XP_LINE} label="Rata-rata XP" />
    </div>
  );

  if (q.isLoading) {
    return (
      <SectionContainerAILN
        title="Tren Skor Kompetensi"
        desc="Periode program · per minggu"
        headerRight={legend}
      >
        <div className="h-[220px] animate-pulse rounded-md bg-muted" />
      </SectionContainerAILN>
    );
  }

  if (q.error || !q.data) {
    return (
      <SectionContainerAILN
        title="Tren Skor Kompetensi"
        desc="Periode program · per minggu"
        headerRight={legend}
      >
        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          Gagal memuat tren penguasaan.
        </div>
      </SectionContainerAILN>
    );
  }

  return (
    <SectionContainerAILN
      title="Tren Skor Kompetensi"
      desc="Periode program · per minggu"
      headerRight={legend}
    >
      <div className="h-[220px]">
        <TrendChart data={q.data.weeks} />
      </div>
    </SectionContainerAILN>
  );
}

function LegendLine({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
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
      <LineChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          fontSize={11}
        />
        <YAxis yAxisId="level" domain={[0, 4]} hide />
        <YAxis
          yAxisId="xp"
          domain={[0, (max: number) => Math.max(Math.ceil(max * 1.15), 1)]}
          hide
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border)" }}
          content={
            <ChartTooltipContent
              labelKey="label"
              formatter={(value, name) => {
                const isLevel = name === "avg_level";
                const color = isLevel ? LEVEL_LINE : XP_LINE;
                const text = isLevel
                  ? `${Number(value).toLocaleString("id-ID", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })} / 4`
                  : `${Number(value).toLocaleString("id-ID")} XP`;

                return (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-[3px] w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted-foreground">
                        {isLevel ? "Rata-rata Level" : "Rata-rata XP"}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {text}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Line
          yAxisId="level"
          dataKey="avg_level"
          type="monotone"
          stroke={LEVEL_LINE}
          strokeWidth={2.5}
          dot={{ r: 3, strokeWidth: 2, fill: "var(--background)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="xp"
          dataKey="avg_xp"
          type="monotone"
          stroke={XP_LINE}
          strokeWidth={2.5}
          dot={{ r: 3, strokeWidth: 2, fill: "var(--background)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
