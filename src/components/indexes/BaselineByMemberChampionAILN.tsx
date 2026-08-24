"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { EmptyHintAILN } from "@/components/states/DataStatesAILN";
import { formatInt, formatScore } from "@/lib/format";
import { getPreAssessmentTeamMock } from "@/mock-data/champion";
import Image from "next/image";

// Pillar keys → table header (short) labels; keys mirror buildPreAssessmentReport.
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

// Deterministic avatar gradient from the member's name (mirrors the team table).
const AVATAR_GRADIENTS = [
  "from-fuchsia-500 to-pink-500",
  "from-sky-500 to-blue-500",
  "from-emerald-500 to-green-500",
  "from-orange-500 to-red-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-teal-500",
];
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Team competency baseline matrix: one row per member, six pillar score chips +
// average, grouped under each department the champion owns. Headline stats
// summarize the team below the table.
export default function BaselineByMemberChampionAILN() {
  const data = getPreAssessmentTeamMock();
  const multiDept = data.departments.length > 1;

  return (
    <SectionContainerAILN
      title="Baseline per Anggota (6 pillar)"
      desc={
        data
          ? `${formatInt(data.completed_count)} dari ${formatInt(
              data.total_members
            )} karyawan · skor baseline per pillar (skala 1–5)`
          : "Skor baseline per pillar (skala 1–5)"
      }
      contentClassName="flex flex-col gap-5"
    >
      {data.departments.length === 0 ? (
        <EmptyHintAILN className="h-48">
          Belum ada anggota tim yang menyelesaikan pre-assessment.
        </EmptyHintAILN>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dashboard-border text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-3 text-left font-bold">Anggota</th>
                  {data.team_pillars
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
                </tr>
              </thead>
              <tbody>
                {data.departments.map((dept) => (
                  <DepartmentRows
                    key={dept.id}
                    dept={dept}
                    showHeader={multiDept}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Headline stats */}
          <div className="grid grid-cols-3 gap-3 border-t border-dashboard-border pt-4 text-center">
            <Stat
              value={formatScore(data.team_avg)}
              label="Avg baseline tim"
              tone="neutral"
            />
            <Stat
              value={formatInt(data.gap_large_count)}
              label="Anggota gap besar (<2,0)"
              tone="warn"
            />
            <Stat
              value={formatInt(data.ready_count)}
              label="Anggota siap (≥2,5)"
              tone="good"
            />
          </div>
        </>
      )}
    </SectionContainerAILN>
  );
}

type Department = ReturnType<
  typeof getPreAssessmentTeamMock
>["departments"][number];

function DepartmentRows({
  dept,
  showHeader,
}: {
  dept: Department;
  showHeader: boolean;
}) {
  const colSpan = PILLAR_ORDER.length + 2;
  return (
    <>
      {showHeader && (
        <tr className="bg-gray-50 dark:bg-card-2">
          <td
            colSpan={colSpan}
            className="px-1 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300"
          >
            {dept.name}{" "}
            <span className="font-medium normal-case tracking-normal text-gray-400 dark:text-gray-500">
              · {formatInt(dept.completed_count)}/{formatInt(dept.member_count)}{" "}
              selesai · avg {formatScore(dept.avg)}
            </span>
          </td>
        </tr>
      )}
      {dept.members.map((m) => (
        <tr
          key={m.member_id}
          className="border-b border-dashboard-border/60 last:border-b-0"
        >
          <td className="py-2.5 pr-3 text-left">
            <div className="flex items-center gap-2.5">
              <MemberAvatar name={m.name} src={m.avatar} />
              <span className="truncate font-semibold text-foreground">
                {m.name}
              </span>
            </div>
          </td>
          {m.pillars
            .slice()
            .sort((a, b) => orderIndex(a.key) - orderIndex(b.key))
            .map((p) => (
              <td key={p.key} className="px-2 py-2.5 text-center">
                <PillarCell score={p.score} weakest={p.key === m.weakest_key} />
              </td>
            ))}
          <td className="px-2 py-2.5 text-center">
            <span
              className={`font-bold tabular-nums ${
                m.avg >= 2.5
                  ? "text-emerald-700 dark:text-emerald-300"
                  : m.avg < 2.0
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-foreground"
              }`}
            >
              {formatScore(m.avg)}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

function MemberAvatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={28}
        height={28}
        unoptimized
        className="size-7 shrink-0 rounded-full object-cover"
      />
    );
  }
  const gradient = AVATAR_GRADIENTS[hashString(name) % AVATAR_GRADIENTS.length];
  return (
    <div
      className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-bold text-white`}
    >
      {getInitials(name)}
    </div>
  );
}

// One score chip; green once it clears the 3.2 maturity threshold, amber below.
// A ring marks the member's weakest pillar — the first thing to coach.
function PillarCell({ score, weakest }: { score: number; weakest: boolean }) {
  const green = score >= 3.2;
  return (
    <span
      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-bold tabular-nums ${
        green
          ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-400/25 dark:text-emerald-200"
          : "bg-amber-200 text-amber-800 dark:bg-amber-400/25 dark:text-amber-200"
      } ${weakest ? "ring-2 ring-amber-500/70 ring-offset-1 ring-offset-card-1" : ""}`}
      title={weakest ? "Pillar terlemah anggota ini" : undefined}
    >
      {formatScore(score)}
    </span>
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
