"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import ClusterScoreChipAILN from "@/components/labels/ClusterScoreChipAILN";
import { EmptyHintAILN } from "@/components/states/DataStatesAILN";
import { formatInt, formatScore } from "@/lib/format";
import type { PreAssessmentOrganization } from "@/apis/sponsor";

// Department baseline matrix: cluster averages 0-100 over scored members, weakest department first.
export default function BaselineByDepartmentAILN({
  data,
}: {
  data: PreAssessmentOrganization | null;
}) {
  const departments = data?.departments ?? [];
  const columns = departments[0]?.clusters ?? [];

  return (
    <SectionContainerAILN
      title="Baseline per Departemen"
      desc={
        data
          ? `${formatInt(data.department_count)} departemen · ${formatInt(
              data.submitted_count,
            )} dari ${formatInt(data.total_members)} karyawan sudah mengisi · skor per area (0–100)`
          : "Skor per area (0–100)"
      }
      contentClassName="flex flex-col gap-5"
    >
      {!data || departments.length === 0 ? (
        <EmptyHintAILN className="h-48">
          Belum ada departemen dengan anggota.
        </EmptyHintAILN>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dashboard-border text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-3 text-left">Departemen</th>
                  {columns.map((c) => (
                    <th key={c.code} className="px-2 py-2 text-center">
                      {c.name}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center">Avg</th>
                  <th className="px-2 py-2 text-center">Capai target</th>
                  <th className="py-2 pl-2 text-right">Mengisi</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b border-dashboard-border/60 last:border-b-0"
                  >
                    <td className="py-2.5 pr-3 text-left">
                      <span className="font-medium text-foreground">
                        {dept.name}
                      </span>{" "}
                      <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                        {formatInt(dept.member_count)}
                      </span>
                    </td>
                    {dept.clusters.map((c) => (
                      <td key={c.code} className="px-2 py-2.5 text-center">
                        <ClusterScoreChipAILN score={c.score} />
                      </td>
                    ))}
                    <td className="px-2 py-2.5 text-center font-medium tabular-nums text-foreground">
                      {dept.avg === null ? "–" : formatScore(dept.avg)}
                    </td>
                    <td className="px-2 py-2.5 text-center text-xs tabular-nums text-gray-600 dark:text-gray-300">
                      {dept.scored_count === 0
                        ? "–"
                        : `${formatInt(dept.meets_target_count)}/${formatInt(dept.scored_count)}`}
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
              value={data.org_avg === null ? "–" : formatScore(data.org_avg)}
              label="Avg skor organisasi (0–100)"
              tone="neutral"
            />
            <Stat
              value={formatInt(data.scored_count - data.meets_target_count)}
              label={`Karyawan di bawah target (band ${data.target_band.band})`}
              tone="warn"
            />
            <Stat
              value={formatInt(data.meets_target_count)}
              label="Karyawan capai target"
              tone="good"
            />
          </div>
        </>
      )}
    </SectionContainerAILN>
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
      <span className="w-9 text-right text-xs font-medium tabular-nums text-gray-600 dark:text-gray-300">
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
      <span className={`font-headline text-2xl font-medium tabular-nums ${valueColor}`}>
        {value}
      </span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
