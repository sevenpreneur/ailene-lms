"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { EmptyHintAILN } from "@/components/states/DataStatesAILN";
import { formatScore } from "@/lib/format";
import { getPreAssessmentTeamMock } from "@/mock-data/champion";

// Pillar keys → ranking (descriptive) labels; keys mirror buildPreAssessmentReport.
const PILLAR_LONG: Record<string, string> = {
  ai_foundation: "AI Foundation",
  prompting: "Prompting Quality",
  tool_fluency: "Tool Fluency",
  use_case_diversity: "Use Case Diversity",
  ai_habit: "AI Habit",
  agentic: "Agentic Capabilities",
};
const SCORE_MAX = 5;

// Team pillar ranking: mean baseline per pillar across the champion's members,
// lowest first — i.e. the coaching priority order, with the maturity target
// drawn as a line on each bar.
export default function PillarRankingChampionAILN() {
  const data = getPreAssessmentTeamMock();

  return (
    <SectionContainerAILN
      title="Prioritas Coaching per Pillar"
      desc="Rata-rata baseline tim · garis = target · diurut dari skor terendah"
    >
      {data.departments.length === 0 ? (
        <EmptyHintAILN className="h-40">Belum ada data.</EmptyHintAILN>
      ) : (
        <div className="flex flex-col gap-4">
          {data.team_pillars.map((p, i) => (
            <PillarRankRow
              key={p.key}
              rank={i + 1}
              label={PILLAR_LONG[p.key]}
              score={p.score}
              target={data.target}
            />
          ))}
        </div>
      )}
    </SectionContainerAILN>
  );
}

function PillarRankRow({
  rank,
  label,
  score,
  target,
}: {
  rank: number;
  label: string;
  score: number;
  target: number;
}) {
  const fillPct = Math.min((score / SCORE_MAX) * 100, 100);
  const targetPct = Math.min((target / SCORE_MAX) * 100, 100);
  const reached = score >= target;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
          <span className="text-gray-400 dark:text-gray-500">{rank}.</span>{" "}
          {label}
        </span>
        <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
          {formatScore(score)} / {SCORE_MAX}
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
        <div
          className={`h-full rounded-full ${
            reached ? "bg-emerald-600" : "bg-amber-500"
          }`}
          style={{ width: `${Math.max(fillPct, score > 0 ? 3 : 0)}%` }}
        />
        {/* target line */}
        <span
          className="absolute top-0 h-full w-px bg-gray-500/70 dark:bg-gray-300/60"
          style={{ left: `${targetPct}%` }}
          title={`Target ${formatScore(target)}`}
        />
      </div>
    </div>
  );
}
