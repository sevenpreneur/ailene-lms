"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { EmptyHintAILN } from "@/components/states/DataStatesAILN";
import { formatInt, formatScore } from "@/lib/format";
import type { PreAssessmentOrganization } from "@/apis/sponsor";

// Pillar keys → table header (short) labels; keys mirror the API's pillar keys.
const PILLAR_SHORT: Record<string, string> = {
  ai_foundation: "AI Foundation",
  prompting: "Prompting",
  tool_fluency: "Tool Fluency",
  use_case_diversity: "Use Case",
  ai_habit: "AI Habit",
  agentic: "Agentic",
};
const PILLAR_ORDER = [
  "ai_foundation",
  "prompting",
  "tool_fluency",
  "use_case_diversity",
  "ai_habit",
  "agentic",
];
const orderIndex = (key: string) => PILLAR_ORDER.indexOf(key);

// Org competency baseline matrix: one row per department, six pillar chips + average + completion.
const EMPTY_ORG_PRE_ASSESSMENT: PreAssessmentOrganization = {
  department_count: 0,
  total_members: 0,
  completed_count: 0,
  measured_at: null,
  target: 0,
  org_avg: 0,
  ready_count: 0,
  gap_large_count: 0,
  departments: [],
  org_pillars: [],
  readiness: { ready: 0, developing: 0, basic: 0 },
};

export default function BaselineByDepartmentAILN({
  data: payload,
}: {
  data: PreAssessmentOrganization | null;
}) {
  const data = payload ?? EMPTY_ORG_PRE_ASSESSMENT;

  return (
    <SectionContainerAILN
      title="Baseline per Departemen (6 pillar)"
      desc={`${formatInt(data.department_count)} departemen · ${formatInt(
        data.total_members
      )} karyawan · skor baseline per pillar (skala 1–5)`}
      contentClassName="flex flex-col gap-5"
    >
      {data.departments.length === 0 ? (
        <EmptyHintAILN className="h-48">
          Belum ada departemen yang menyelesaikan pre-assessment.
        </EmptyHintAILN>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dashboard-border text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-3 text-left font-bold">Departemen</th>
                  {data.org_pillars
                    .slice()
                    .sort((a, b) => orderIndex(a.key) - orderIndex(b.key))
                    .map((p) => (
                      <th
                        key={p.key}
                        className="px-2 py-2 text-center font-bold"
                      >
                        {PILLAR_SHORT[p.key]}
                      </th>
                    ))}
                  <th className="px-2 py-2 text-center font-bold">Avg</th>
                  <th className="py-2 pl-2 text-right font-bold">Selesai</th>
                </tr>
              </thead>
              <tbody>
                {data.departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b border-dashboard-border/60 last:border-b-0"
                  >
                    <td className="py-2.5 pr-3 text-left">
                      <span className="font-semibold text-foreground">
                        {dept.name}
                      </span>{" "}
                      <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                        {formatInt(dept.member_count)}
                      </span>
                    </td>
                    {dept.pillars.map((p) => (
                      <td key={p.key} className="px-2 py-2.5 text-center">
                        <PillarCell score={p.score} />
                      </td>
                    ))}
                    <td className="px-2 py-2.5 text-center">
                      <span
                        className={`font-bold tabular-nums ${
                          dept.avg >= 2.5
                            ? "text-emerald-700 dark:text-emerald-300"
                            : dept.avg < 2.0
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-foreground"
                        }`}
                      >
                        {formatScore(dept.avg)}
                      </span>
                    </td>
                    <td className="py-2.5 pl-2">
                      <CompletionBar percent={dept.completion_percent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Headline stats */}
          <div className="grid grid-cols-3 gap-3 border-t border-dashboard-border pt-4 text-center">
            <Stat
              value={formatScore(data.org_avg)}
              label="Avg baseline org"
              tone="neutral"
            />
            <Stat
              value={formatInt(data.gap_large_count)}
              label="Departemen gap besar (<2,0)"
              tone="warn"
            />
            <Stat
              value={formatInt(data.ready_count)}
              label="Departemen siap (≥2,5)"
              tone="good"
            />
          </div>
        </>
      )}
    </SectionContainerAILN>
  );
}

// One score chip; green once it clears the 3.2 maturity threshold, amber below.
function PillarCell({ score }: { score: number }) {
  const green = score >= 3.2;
  return (
    <span
      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-bold tabular-nums ${
        green
          ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-400/25 dark:text-emerald-200"
          : "bg-amber-200 text-amber-800 dark:bg-amber-400/25 dark:text-amber-200"
      }`}
    >
      {formatScore(score)}
    </span>
  );
}

function CompletionBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${Math.max(percent, percent > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs font-semibold tabular-nums text-gray-600 dark:text-gray-300">
        {percent}%
      </span>
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "neutral" | "warn" | "good";
}) {
  const valueColor =
    tone === "warn"
      ? "text-amber-700 dark:text-amber-300"
      : tone === "good"
        ? "text-emerald-700 dark:text-emerald-300"
        : "text-foreground";
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>
        {value}
      </span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
