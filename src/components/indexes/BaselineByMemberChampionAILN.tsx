"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import BandLabelAILN from "@/components/labels/BandLabelAILN";
import ClusterScoreChipAILN from "@/components/labels/ClusterScoreChipAILN";
import { EmptyHintAILN } from "@/components/states/DataStatesAILN";
import { formatInt, formatScore } from "@/lib/format";
import type {
  PreAssessmentMemberStatus,
  PreAssessmentTeam,
} from "@/apis/champion";
import Image from "next/image";

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

const PENDING_LABEL: Record<
  Exclude<PreAssessmentMemberStatus, "scored">,
  string
> = {
  submitted: "Sedang dinilai",
  not_started: "Belum mengisi",
};

// Team baseline matrix: one row per member, cluster scores 0-100; unscored members sit at the bottom.
export default function BaselineByMemberChampionAILN({
  data,
}: {
  data: PreAssessmentTeam | null;
}) {
  const members = data?.members ?? [];
  const clusters = data?.team_clusters ?? [];
  // team_clusters is weakest-first; the matrix keeps the members' own (taxonomy) order.
  const columns = members[0]?.clusters ?? clusters;

  return (
    <SectionContainerAILN
      title="Baseline per Anggota"
      desc={
        data
          ? `${formatInt(data.submitted_count)} dari ${formatInt(
              data.total_members,
            )} anggota sudah mengisi · skor per area (0–100)`
          : "Skor per area (0–100)"
      }
      contentClassName="flex flex-col gap-5"
    >
      {!data || members.length === 0 ? (
        <EmptyHintAILN className="h-48">
          Belum ada anggota di tim ini.
        </EmptyHintAILN>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dashboard-border text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-3 text-left">Anggota</th>
                  <th className="px-2 py-2 text-left">Band</th>
                  {columns.map((c) => (
                    <th key={c.code} className="px-2 py-2 text-center">
                      {c.name}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center">Avg</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.access_id}
                    className="border-b border-dashboard-border/60 last:border-b-0"
                  >
                    <td className="py-2.5 pr-3 text-left">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar name={m.name} src={m.avatar} />
                        <span className="truncate font-medium text-foreground">
                          {m.name}
                          {m.is_me && (
                            <span className="ml-1 font-light text-muted-foreground">
                              (Anda)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    {m.status === "scored" && m.band ? (
                      <>
                        <td className="px-2 py-2.5">
                          <BandLabelAILN
                            band={m.band}
                            meetsTarget={m.meets_target}
                          />
                        </td>
                        {m.clusters.map((c) => (
                          <td key={c.code} className="px-2 py-2.5 text-center">
                            <ClusterScoreChipAILN
                              score={c.score}
                              weakest={c.code === m.weakest_code}
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2.5 text-center font-medium tabular-nums text-foreground">
                          {m.avg === null ? "–" : formatScore(m.avg)}
                        </td>
                      </>
                    ) : (
                      <td
                        colSpan={columns.length + 2}
                        className="px-2 py-2.5 text-left text-xs text-muted-foreground"
                      >
                        {PENDING_LABEL[m.status as keyof typeof PENDING_LABEL]}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Headline stats */}
          <div className="grid grid-cols-3 gap-3 border-t border-dashboard-border pt-4 text-center">
            <Stat
              value={data.team_avg === null ? "–" : formatScore(data.team_avg)}
              label="Avg skor tim (0–100)"
              tone="neutral"
            />
            <Stat
              value={formatInt(data.scored_count - data.meets_target_count)}
              label={`Di bawah target (band ${data.target_band.band})`}
              tone="warn"
            />
            <Stat
              value={formatInt(data.meets_target_count)}
              label="Sudah capai target"
              tone="good"
            />
          </div>
        </>
      )}
    </SectionContainerAILN>
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
      className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-medium text-white`}
    >
      {getInitials(name)}
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
      <span className={`text-2xl font-medium tabular-nums ${valueColor}`}>
        {value}
      </span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
