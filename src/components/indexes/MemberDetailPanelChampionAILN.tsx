"use client";
import DisabledActionButtonAILN from "@/components/buttons/DisabledActionButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getMemberDetailMock } from "@/mock-data/champion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Send } from "lucide-react";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

dayjs.extend(relativeTime);

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
  score: { label: "Skor", color: "var(--chart-3)" },
  target: { label: "Target", color: "#94a3b8" },
} satisfies ChartConfig;

function targetScoreForDimension(key: string, targetLevelNumber: number) {
  const mainTarget = Math.max(1, Math.min(5, targetLevelNumber + 1));
  if (key === "agentic_capabilities") {
    return Math.max(1, Math.min(5, targetLevelNumber));
  }
  return mainTarget;
}

export default function MemberDetailPanelChampionAILN({
  memberId,
}: {
  memberId: number;
}) {
  const detail = getMemberDetailMock({ member_id: memberId });

  const [noteText, setNoteText] = useState("");

  if (!detail) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashboard-border bg-card-1 text-sm text-gray-500 dark:text-gray-400">
        Gagal memuat detail anggota.
      </div>
    );
  }

  const { member, metrics, radar, gate, notes } = detail;
  const dimensions = radar.dimensions;

  const avgComp =
    dimensions.length > 0
      ? dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
      : 0;
  const weakest = dimensions.reduce(
    (min, d) => (d.score < min.score ? d : min),
    dimensions[0]
  );
  const gateDone = gate.requirements.filter((r) => r.completed).length;
  const gateTotal = gate.requirements.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Identity */}
      <div className="flex items-center gap-3 rounded-lg border border-dashboard-border bg-card-1 p-4">
        <Avatar name={member.full_name} src={member.avatar} />
        <div className="min-w-0">
          <div className="truncate text-base font-bold text-gray-900 dark:text-white">
            {member.full_name}
          </div>
          <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
            {member.job_title}
            {member.group ? ` · ${member.group.name}` : ""}
          </div>
        </div>
      </div>

      {/* Competency */}
      <SectionContainerAILN
        title="Skill Competency"
        desc="Diagnosa 6 pillar kompetensi"
        contentClassName="flex flex-col gap-5"
      >
        <RadarBlock
          dimensions={dimensions}
          targetLevelNumber={member.current_level.level_number}
        />
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Diagnostic per Pillar
          </p>
          {dimensions.map((d) => {
            const pct = Math.max(0, Math.min(100, (d.score / 5) * 100));
            return (
              <div key={d.key}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-foreground dark:text-white">
                    {d.label}
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
      </SectionContainerAILN>

      {/* Key metrics */}
      <SectionContainerAILN
        title="Key Metrics"
        contentClassName="grid grid-cols-2 gap-3"
      >
        <MetricCard label="Submission" value={`${metrics.submission_total}`} />
        <MetricCard
          label={`Gate L${gate.from_level} → L${gate.to_level}`}
          value={`${gateDone}/${gateTotal}`}
          sub={`${gate.percent}% terpenuhi`}
        />
        <MetricCard
          label="Rata-rata kompetensi"
          value={formatScore(avgComp)}
          unit="/ 5"
        />
        <MetricCard
          label="Pillar terlemah"
          value={weakest?.label ?? "—"}
          accent
        />
      </SectionContainerAILN>

      {/* Coaching notes */}
      <SectionContainerAILN
        title="Catatan Coaching"
        contentClassName="flex flex-col gap-3"
      >
        {notes.length > 0 && (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10"
              >
                <p className="text-gray-800 dark:text-gray-200">{note.text}</p>
                <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-300/70">
                  {note.champion_name} ·{" "}
                  {dayjs(note.created_at).format("D MMM YYYY, HH:mm")}
                </p>
              </div>
            ))}
          </div>
        )}
        <TextAreaAILN
          textAreaId="coaching-note"
          textAreaPlaceholder={`Tulis catatan coaching untuk ${
            member.full_name.split(" ")[0]
          }…`}
          textAreaHeight="h-20"
          characterLength={1000}
          variant="CHAMPION"
          value={noteText}
          onTextAreaChange={setNoteText}
        />
        <DisabledActionButtonAILN
          variant="champion"
          size="medium"
          className="self-end"
        >
          <Send className="size-4" />
          Kirim Catatan
        </DisabledActionButtonAILN>
      </SectionContainerAILN>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashboard-border bg-card-2 p-3">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 flex items-end gap-1">
        <span
          className={`text-xl font-bold leading-none ${
            accent
              ? "text-amber-600 dark:text-amber-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="pb-0.5 text-xs font-semibold text-gray-400">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {sub}
        </div>
      )}
    </div>
  );
}

function RadarBlock({
  dimensions,
  targetLevelNumber,
}: {
  dimensions: { key: string; label: string; score: number }[];
  targetLevelNumber: number;
}) {
  const chartData = dimensions.map((d) => ({
    dimension: d.label,
    score: d.score,
    target: targetScoreForDimension(d.key, targetLevelNumber),
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
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
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

function Avatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className="size-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-sm font-bold text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200">
      {name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()}
    </div>
  );
}
