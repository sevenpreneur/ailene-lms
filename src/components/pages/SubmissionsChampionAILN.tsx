"use client";
import SubmissionItemChampion, {
  deriveStatus,
  type ReviewStatus,
  type SubmissionRow,
} from "@/components/items/SubmissionItemChampion";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { ChampionSubmissions } from "@/apis/champion";
import dayjs from "dayjs";
import { ClipboardList } from "lucide-react";
import { useState } from "react";

const FILTERS: { key: ReviewStatus; label: string }[] = [
  { key: "AWAITING_REVIEW", label: "Belum direview" },
  { key: "NEEDS_REVISION", label: "Menunggu revisi" },
  { key: "ACCEPTED", label: "Sudah diterima" },
];

export default function SubmissionsChampionAILN({
  promptSubmissions,
  useCaseSubmissions,
}: {
  promptSubmissions: ChampionSubmissions | null;
  useCaseSubmissions: ChampionSubmissions | null;
}) {
  const projectId = useProjectId();

  const [filter, setFilter] = useState<ReviewStatus>("AWAITING_REVIEW");

  const toRow = (
    r: ChampionSubmissions["list"][number],
    kind: SubmissionRow["kind"]
  ): SubmissionRow => ({
    id: r.id,
    kind,
    href: `/${projectId}/champion/submissions/${
      kind === "PROMPT" ? "prompts" : "use-cases"
    }/${r.id}`,
    level_number: r.subject.level?.level_number ?? null,
    title: r.subject.name,
    body: r.subject.text,
    category: r.categories[0]?.name ?? null,
    member: r.member,
    deadline: r.deadline,
    submitted_at: r.submitted_at,
    reviewed_at: r.reviewed_at,
    is_accepted: r.is_accepted,
    hours_with_ai: r.hours_with_ai,
    ai_tool: r.ai_tool,
  });

  const rows: SubmissionRow[] = [
    ...(promptSubmissions?.list ?? []).map((r) => toRow(r, "PROMPT")),
    ...(useCaseSubmissions?.list ?? []).map((r) => toRow(r, "USE_CASE")),
  ];

  const counts: Record<ReviewStatus, number> = {
    AWAITING_REVIEW: 0,
    NEEDS_REVISION: 0,
    ACCEPTED: 0,
  };
  for (const r of rows) {
    const s = deriveStatus(r);
    if (s !== "PENDING_SUBMIT") counts[s] += 1;
  }

  const visible = rows
    .filter((r) => deriveStatus(r) === filter)
    .sort(
      (a, b) =>
        dayjs(b.submitted_at ?? 0).valueOf() -
        dayjs(a.submitted_at ?? 0).valueOf()
    );

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Review Tugas"
          desc="Klik untuk membuka review detail dan menilai semua isian student."
        />

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <FilterPill
              key={f.key}
              active={filter === f.key}
              label={f.label}
              count={counts[f.key]}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            label={`Tidak ada tugas dengan status "${
              FILTERS.find((f) => f.key === filter)?.label
            }".`}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visible.map((r) => (
              <SubmissionItemChampion key={`${r.kind}-${r.id}`} row={r} />
            ))}
          </div>
        )}
      </div>
    </PageContainerAILN>
  );
}

function FilterPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-claude bg-claude/10 text-claude dark:border-claude/40 dark:text-lime-bright"
          : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white ${
          active ? "bg-claude" : "bg-gray-400 dark:bg-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border py-12 text-center text-gray-500 dark:text-gray-400">
      <ClipboardList className="size-6" />
      <div className="text-sm">{label}</div>
    </div>
  );
}
