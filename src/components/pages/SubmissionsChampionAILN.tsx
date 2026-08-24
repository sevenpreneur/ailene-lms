"use client";
import SubmissionItemChampion, {
  deriveStatus,
  type ReviewStatus,
  type SubmissionRow,
} from "@/components/items/SubmissionItemChampion";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { useProjectId } from "@/lib/use-project-id";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";

const FILTERS: { key: ReviewStatus; label: string }[] = [
  { key: "AWAITING_REVIEW", label: "Belum direview" },
  { key: "NEEDS_REVISION", label: "Menunggu revisi" },
  { key: "ACCEPTED", label: "Sudah diterima" },
];

export default function SubmissionsChampionAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const projectId = useProjectId();

  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const [filter, setFilter] = useState<ReviewStatus>("AWAITING_REVIEW");

  const promptsQ = trpc.list.promptSubmissions.useQuery();
  const useCasesQ = trpc.list.useCaseSubmissions.useQuery();

  const rows: SubmissionRow[] = [
    ...(promptsQ.data?.list ?? []).map(
      (r): SubmissionRow => ({
        id: r.id,
        kind: "PROMPT",
        href: `/${projectId}/champion/submissions/prompts/${r.id}`,
        level_number: r.prompt.level.level_number,
        title: r.prompt.name,
        body: r.prompt.scenario,
        category: r.prompt.categories[0]?.name ?? null,
        member: r.member,
        deadline: r.deadline as unknown as string | null,
        submitted_at: r.submitted_at as unknown as string | null,
        reviewed_at: r.reviewed_at as unknown as string | null,
        is_accepted: r.is_accepted,
        hours_with_ai: null,
        ai_tool: null,
      })
    ),
    ...(useCasesQ.data?.list ?? []).map(
      (r): SubmissionRow => ({
        id: r.id,
        kind: "USE_CASE",
        href: `/${projectId}/champion/submissions/use-cases/${r.id}`,
        level_number: r.use_case.level.level_number,
        title: r.use_case.name,
        body: r.use_case.description,
        category: r.use_case.categories[0]?.name ?? null,
        member: r.member,
        deadline: r.deadline as unknown as string | null,
        submitted_at: r.submitted_at as unknown as string | null,
        reviewed_at: r.reviewed_at as unknown as string | null,
        is_accepted: r.is_accepted,
        hours_with_ai: r.hours_with_ai,
        ai_tool: r.ai_tool,
      })
    ),
  ];

  const isLoading = promptsQ.isLoading || useCasesQ.isLoading;
  const error = promptsQ.error || useCasesQ.error;

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

        {error ? (
          <AppErrorComponents />
        ) : isLoading ? (
          <SubmissionsSkeleton />
        ) : visible.length === 0 ? (
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
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-300"
          : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white ${
          active ? "bg-emerald-600" : "bg-gray-400 dark:bg-gray-600"
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

function SubmissionsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1"
        />
      ))}
    </div>
  );
}
