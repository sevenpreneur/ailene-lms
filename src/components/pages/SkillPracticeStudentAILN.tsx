"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import SkillPracticeCardAILN, {
  type Category,
  type PracticeKind,
  type PracticeStatus,
} from "@/components/items/SkillPracticeCardAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { AssignedPrompt, PromptLibraryItem } from "@/apis/prompts";
import type { AssignedUseCase, UseCaseLibraryItem } from "@/apis/use-cases";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { BookOpen, Clock, History, Library, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, type ReactNode, useState } from "react";
import { toast } from "sonner";

dayjs.locale("id");

type PracticeTab = "ASSIGNED" | "LIBRARY" | "HISTORY";

interface PracticeItem {
  id: number;
  kind: PracticeKind;
  href: string;
  title: string;
  body: string;
  level_number: number;
  categories: Category[];
  champion_name: string | null;
  deadline: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean;
}

interface LibraryItem {
  id: number;
  kind: PracticeKind;
  href: string;
  title: string;
  body: string;
  level_number: number;
  categories: Category[];
  submission: {
    deadline: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    is_accepted: boolean;
  } | null;
}

async function selfAssign(kind: PracticeKind, id: number): Promise<boolean> {
  const endpoint =
    kind === "PROMPT" ? "/api/prompts/self-assign" : "/api/use-cases/self-assign";
  const body =
    kind === "PROMPT" ? { prompt_id: id } : { use_case_id: id };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(data?.message ?? "Gagal self-assign latihan.");
      return false;
    }
    return true;
  } catch {
    toast.error("Gagal self-assign latihan.");
    return false;
  }
}

function practiceHref(projectId: string, kind: PracticeKind, refId: number) {
  return kind === "PROMPT"
    ? `/${projectId}/student/skill-practice/prompts/${refId}`
    : `/${projectId}/student/skill-practice/use-cases/${refId}`;
}

function tabFromParam(value: string | null): PracticeTab {
  if (value === "library") return "LIBRARY";
  if (value === "history") return "HISTORY";
  return "ASSIGNED";
}

function deriveStatus(item: {
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean;
}): PracticeStatus {
  if (item.is_accepted) return "ACCEPTED";
  if (!item.submitted_at) return "PENDING_SUBMIT";
  if (
    item.reviewed_at &&
    dayjs(item.reviewed_at).isAfter(dayjs(item.submitted_at))
  ) {
    return "NEEDS_REVISION";
  }
  return "AWAITING_REVIEW";
}

function assignedToPracticeItem(
  kind: PracticeKind,
  row: AssignedPrompt | AssignedUseCase,
  projectId: string
): PracticeItem {
  return {
    id: row.id,
    kind,
    href: practiceHref(projectId, kind, row.id),
    title: row.name,
    body: row.description,
    level_number: row.level_number,
    categories: row.categories,
    champion_name: row.assigned_by?.name ?? null,
    deadline: row.deadline_at,
    submitted_at: row.submitted_at,
    reviewed_at: row.reviewed_at,
    is_accepted: row.is_accepted,
  };
}

function libraryToItem(
  kind: PracticeKind,
  row: PromptLibraryItem | UseCaseLibraryItem,
  projectId: string
): LibraryItem {
  return {
    id: row.id,
    kind,
    href: practiceHref(projectId, kind, row.id),
    title: row.name,
    body: row.description,
    level_number: row.level_number,
    categories: row.categories,
    submission: row.submitted_at
      ? {
          deadline: row.deadline_at,
          submitted_at: row.submitted_at,
          reviewed_at: row.reviewed_at,
          is_accepted: row.is_accepted ?? false,
        }
      : null,
  };
}

export default function SkillPracticeStudentAILN({
  promptLibrary,
  useCaseLibrary,
  assignedPrompts,
  assignedUseCases,
}: {
  promptLibrary: PromptLibraryItem[];
  useCaseLibrary: UseCaseLibraryItem[];
  assignedPrompts: AssignedPrompt[];
  assignedUseCases: AssignedUseCase[];
}) {
  const searchParams = useSearchParams();
  const projectId = useProjectId();

  const [tab, setTab] = useState<PracticeTab>(() =>
    tabFromParam(searchParams.get("tab"))
  );

  useEffect(() => {
    setTab(tabFromParam(searchParams.get("tab")));
  }, [searchParams]);

  const assignedItems: PracticeItem[] = [
    ...assignedPrompts.map((r) =>
      assignedToPracticeItem("PROMPT", r, projectId)
    ),
    ...assignedUseCases.map((r) =>
      assignedToPracticeItem("USE_CASE", r, projectId)
    ),
  ].sort((a, b) => {
    const statusOrder =
      Number(a.is_accepted) - Number(b.is_accepted) ||
      Number(Boolean(a.submitted_at)) - Number(Boolean(b.submitted_at));
    if (statusOrder !== 0) return statusOrder;
    return (
      dayjs(a.deadline ?? "9999-12-31").valueOf() -
      dayjs(b.deadline ?? "9999-12-31").valueOf()
    );
  });

  const libraryItems: LibraryItem[] = [
    ...promptLibrary.map((r) => libraryToItem("PROMPT", r, projectId)),
    ...useCaseLibrary.map((r) => libraryToItem("USE_CASE", r, projectId)),
  ].sort((a, b) => {
    if (a.level_number !== b.level_number) {
      return a.level_number - b.level_number;
    }
    return a.title.localeCompare(b.title);
  });

  // History = submitted assigned items + submitted library items not already counted as assigned.
  const assignedIds = new Set(assignedItems.map((i) => `${i.kind}-${i.id}`));
  const historyItems: PracticeItem[] = [
    ...assignedItems.filter((i) => i.submitted_at !== null),
    ...libraryItems
      .filter(
        (i) => i.submission?.submitted_at && !assignedIds.has(`${i.kind}-${i.id}`)
      )
      .map((i) => ({
        id: i.id,
        kind: i.kind,
        href: i.href,
        title: i.title,
        body: i.body,
        level_number: i.level_number,
        categories: i.categories,
        champion_name: null,
        deadline: i.submission!.deadline,
        submitted_at: i.submission!.submitted_at,
        reviewed_at: i.submission!.reviewed_at,
        is_accepted: i.submission!.is_accepted,
      })),
  ];

  const pendingAssignedCount = assignedItems.filter(
    (item) => deriveStatus(item) === "PENDING_SUBMIT"
  ).length;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Latihan Skill"
          desc="Tingkatkan kemampuanmu dengan latihan yang relevan."
        >
          <Link href={`/${projectId}/student/skill-practice/create`}>
            <ButtonAILN
              type="button"
              variant="lime"
              size="medium"
              className="shrink-0"
            >
              <Plus className="size-4" />
              Catat Latihan
            </ButtonAILN>
          </Link>
        </PageHeaderAILN>

        <div className="overflow-x-auto overflow-y-hidden">
          <div className="flex min-w-max items-center border-b border-dashboard-border">
            <TabButton
              active={tab === "ASSIGNED"}
              icon={<Clock className="size-4" />}
              label="Assigned untuk Anda"
              badge={pendingAssignedCount > 0 ? pendingAssignedCount : null}
              onClick={() => setTab("ASSIGNED")}
            />
            <TabButton
              active={tab === "LIBRARY"}
              icon={<Library className="size-4" />}
              label="Library (Self Assign)"
              onClick={() => setTab("LIBRARY")}
            />
            <TabButton
              active={tab === "HISTORY"}
              icon={<History className="size-4" />}
              label="Riwayat Submission"
              onClick={() => setTab("HISTORY")}
            />
          </div>
        </div>

        {tab === "ASSIGNED" && (
          <SectionContainerAILN
            title="Assigned untuk Anda"
            desc="Latihan yang diberikan untuk kamu kerjakan."
            contentClassName="flex flex-col gap-4"
          >
            {assignedItems.length === 0 ? (
              <EmptyState label="Belum ada latihan yang di-assign." />
            ) : (
              <>
                {pendingAssignedCount > 0 && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    Kamu punya <strong>{pendingAssignedCount}</strong> tugas
                    yang belum dikerjakan.
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {assignedItems.map((item) => (
                    <SkillPracticeCardAILN
                      key={`${item.kind}-${item.id}`}
                      kind={item.kind}
                      title={item.title}
                      body={item.body}
                      levelNumber={item.level_number}
                      categories={item.categories}
                      status={deriveStatus(item)}
                      deadline={item.deadline}
                      championName={item.champion_name}
                      message={null}
                      submittedAt={null}
                      href={item.href}
                    />
                  ))}
                </div>
              </>
            )}
          </SectionContainerAILN>
        )}

        {tab === "LIBRARY" && (
          <SectionContainerAILN
            title="Library (Self Assign)"
            desc="Pilih latihan dari prompt dan use case yang tersedia."
            contentClassName="flex flex-col gap-4"
          >
            {libraryItems.length === 0 ? (
              <EmptyState label="Library belum punya latihan aktif." />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {libraryItems.map((item) => (
                  <SkillPracticeCardAILN
                    key={`${item.kind}-${item.id}`}
                    kind={item.kind}
                    title={item.title}
                    body={item.body}
                    levelNumber={item.level_number}
                    categories={item.categories}
                    status={deriveStatus(
                      item.submission ?? {
                        submitted_at: null,
                        reviewed_at: null,
                        is_accepted: false,
                      }
                    )}
                    deadline={item.submission?.deadline ?? null}
                    championName={null}
                    message={null}
                    submittedAt={item.submission?.submitted_at ?? null}
                    href={item.href}
                    onSelfAssign={() => selfAssign(item.kind, item.id)}
                  />
                ))}
              </div>
            )}
          </SectionContainerAILN>
        )}

        {tab === "HISTORY" && (
          <SectionContainerAILN
            title="Riwayat Submission"
            desc="Semua latihan yang berhasil kamu submit."
            contentClassName="flex flex-col gap-4"
          >
            {historyItems.length === 0 ? (
              <EmptyState label="Belum ada submission yang berhasil dikirim." />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {historyItems.map((item) => (
                  <SkillPracticeCardAILN
                    key={`${item.kind}-${item.id}`}
                    kind={item.kind}
                    title={item.title}
                    body={item.body}
                    levelNumber={item.level_number}
                    categories={item.categories}
                    status={deriveStatus(item)}
                    deadline={item.deadline}
                    championName={item.champion_name}
                    message={null}
                    submittedAt={item.submitted_at}
                    href={item.href}
                  />
                ))}
              </div>
            )}
          </SectionContainerAILN>
        )}
      </div>
    </PageContainerAILN>
  );
}

function TabButton({
  active,
  icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  badge?: number | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px inline-flex h-12 cursor-pointer items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${
        active
          ? "border-claude text-claude dark:border-claude dark:text-lime-bright"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-claude px-1.5 py-0.5 text-[11px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border py-12 text-center text-gray-500 dark:text-gray-400">
      <BookOpen className="size-6" />
      <div className="text-sm">{label}</div>
    </div>
  );
}
