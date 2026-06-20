"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { SkeletonBlockAILN } from "@/components/states/DataStatesAILN";
import { formatDecimal, formatInt } from "@/lib/format";
import { trpc } from "@/trpc/client";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Department = {
  id: number;
  name: string;
  member_count: number;
  avg_score: number;
  top_use_case: string | null;
  submission_count: number;
  hours: number;
  trend_percent: number | null;
  rank: number;
};

type SortKey = "avg_score" | "member_count" | "submission_count" | "hours";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "avg_score", label: "Skor" },
  { key: "member_count", label: "Jumlah" },
  { key: "submission_count", label: "Submit" },
  { key: "hours", label: "Jam dihemat" },
];

// Stable per-department avatar tint, picked from the name so each department
// keeps the same color across renders.
const AVATAR_TINTS = [
  "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
];

function tintFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Score bar color by attainment ratio: emerald (strong) → amber → rose.
function scoreBar(ratio: number): string {
  if (ratio >= 0.66) return "bg-emerald-500";
  if (ratio >= 0.4) return "bg-amber-500";
  return "bg-rose-500";
}

export default function OrganizationLeaderboardAILN() {
  const q = trpc.read.organizationLeaderboard.useQuery();
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("avg_score");

  const sortControl = (
    <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
      Sortir:
      <select
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value as SortKey)}
        className="cursor-pointer rounded-md border border-dashboard-border bg-white px-2 py-1 text-xs font-medium text-foreground outline-none dark:bg-card-1"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  if (q.isLoading) {
    return (
      <Section sortControl={sortControl}>
        <SkeletonBlockAILN className="h-64" />
      </Section>
    );
  }

  if (q.error || !q.data) {
    return (
      <Section sortControl={sortControl}>
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Gagal memuat kinerja departemen.
        </div>
      </Section>
    );
  }

  const maxScore = q.data.max_score || 4;
  const list = [...(q.data.list as Department[])].sort(
    (a, b) => b[sortKey] - a[sortKey] || a.name.localeCompare(b.name)
  );

  return (
    <Section sortControl={sortControl}>
      {list.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
          Belum ada departemen.
        </div>
      ) : (
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-dashboard-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 pl-5 pr-3">Departemen</th>
                <th className="py-2.5 pr-3 text-right">Jumlah</th>
                <th className="py-2.5 pr-3">Rata-rata Skor</th>
                <th className="py-2.5 pr-3">Use Case Teratas</th>
                <th className="py-2.5 pr-3 text-right">Submit</th>
                <th className="py-2.5 pr-3 text-right">Jam Dihemat</th>
                <th className="py-2.5 pr-5 text-right">Tren</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => {
                const ratio = maxScore > 0 ? d.avg_score / maxScore : 0;
                return (
                  <tr
                    key={d.id}
                    onClick={() => router.push(`/sponsor/groups/${d.id}`)}
                    className="cursor-pointer border-b border-dashboard-border/60 transition-colors last:border-0 hover:bg-muted/50"
                  >
                    {/* Departemen */}
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tintFor(d.name)}`}
                        >
                          {initials(d.name)}
                        </span>
                        <span className="font-semibold text-foreground">
                          {d.name}
                        </span>
                      </div>
                    </td>

                    {/* Jumlah */}
                    <td className="py-3 pr-3 text-right tabular-nums font-medium text-foreground">
                      {formatInt(d.member_count)}
                    </td>

                    {/* Rata-rata skor */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 shrink-0 tabular-nums font-bold text-foreground">
                          {formatDecimal(d.avg_score)}
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${scoreBar(ratio)}`}
                            style={{ width: `${Math.min(100, ratio * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Use case teratas */}
                    <td className="max-w-[180px] py-3 pr-3">
                      <span className="line-clamp-2 text-muted-foreground">
                        {d.top_use_case ?? "—"}
                      </span>
                    </td>

                    {/* Submit (use case + prompt) */}
                    <td className="py-3 pr-3 text-right tabular-nums text-muted-foreground">
                      {formatInt(d.submission_count)}
                    </td>

                    {/* Jam dihemat */}
                    <td className="py-3 pr-3 text-right tabular-nums font-semibold text-foreground">
                      {formatDecimal(d.hours)}
                    </td>

                    {/* Tren */}
                    <td className="py-3 pr-5 text-right">
                      <TrendCell percent={d.trend_percent} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

function TrendCell({ percent }: { percent: number | null }) {
  if (percent === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const up = percent >= 0;
  const Icon = up ? ArrowUp : ArrowDown;
  const tone = up
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${tone}`}
    >
      <Icon size={14} strokeWidth={2.5} />
      {Math.abs(percent)}%
    </span>
  );
}

function Section({
  children,
  sortControl,
}: {
  children: React.ReactNode;
  sortControl: React.ReactNode;
}) {
  return (
    <SectionContainerAILN
      title="Kinerja per Departemen"
      desc="Klik baris untuk drill-down per departemen"
      headerRight={sortControl}
    >
      {children}
    </SectionContainerAILN>
  );
}
