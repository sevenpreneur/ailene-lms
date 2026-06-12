"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import SkillPracticeCardAILN, {
  type Category,
  type PracticeKind,
  type PracticeStatus,
} from "@/components/items/SkillPracticeCardAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { BookOpen, Clock, History, Library, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

dayjs.locale("id");

type PracticeTab = "ASSIGNED" | "LIBRARY" | "HISTORY";

interface PracticeItem {
  id: number;
  kind: PracticeKind;
  ref_id: number;
  href: string;
  title: string;
  body: string;
  level_number: number;
  categories: Category[];
  champion_name: string | null;
  deadline: string | null;
  message: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  comment: string | null;
  is_accepted: boolean;
}

interface LibraryItem {
  id: number;
  kind: PracticeKind;
  ref_id: number;
  href: string;
  title: string;
  body: string;
  level_number: number;
  categories: Category[];
  submission: {
    id: number;
    deadline: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    is_accepted: boolean;
  } | null;
}

function practiceHref(kind: PracticeKind, refId: number) {
  return kind === "PROMPT"
    ? `/student/skill-practice/prompts/${refId}`
    : `/student/skill-practice/use-cases/${refId}`;
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

export default function SkillPracticeStudentAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const [tab, setTab] = useState<PracticeTab>(() =>
    tabFromParam(searchParams.get("tab"))
  );

  useEffect(() => {
    setTab(tabFromParam(searchParams.get("tab")));
  }, [searchParams]);

  const assignedPromptsQ = trpc.list.assignedPrompts.useQuery();
  const assignedUseCasesQ = trpc.list.assignedUseCases.useQuery();
  const libraryPromptsQ = trpc.list.memberPromptLibrary.useQuery(undefined, {
    enabled: tab === "LIBRARY",
  });
  const libraryUseCasesQ = trpc.list.memberUseCaseLibrary.useQuery(undefined, {
    enabled: tab === "LIBRARY",
  });
  const submissionsQ = trpc.list.practiceSubmissions.useQuery(undefined, {
    enabled: tab === "HISTORY",
  });

  const assignedItems = useMemo<PracticeItem[]>(() => {
    const prompts =
      assignedPromptsQ.data?.list.map((r) => ({
        id: r.id,
        kind: "PROMPT" as const,
        ref_id: r.prompt.id,
        href: practiceHref("PROMPT", r.prompt.id),
        title: r.prompt.name,
        body: r.prompt.scenario,
        level_number: r.prompt.level.level_number,
        categories: r.prompt.categories,
        champion_name: r.assigned_by?.full_name ?? null,
        deadline: r.deadline as unknown as string | null,
        message: r.message,
        submitted_at: r.submitted_at as unknown as string | null,
        reviewed_at: r.reviewed_at as unknown as string | null,
        comment: r.comment,
        is_accepted: r.is_accepted,
      })) ?? [];

    const useCases =
      assignedUseCasesQ.data?.list.map((r) => ({
        id: r.id,
        kind: "USE_CASE" as const,
        ref_id: r.use_case.id,
        href: practiceHref("USE_CASE", r.use_case.id),
        title: r.use_case.name,
        body: r.use_case.description,
        level_number: r.use_case.level.level_number,
        categories: r.use_case.categories,
        champion_name: r.assigned_by?.full_name ?? null,
        deadline: r.deadline as unknown as string | null,
        message: r.message,
        submitted_at: r.submitted_at as unknown as string | null,
        reviewed_at: r.reviewed_at as unknown as string | null,
        comment: r.comment,
        is_accepted: r.is_accepted,
      })) ?? [];

    return [...prompts, ...useCases].sort((a, b) => {
      const statusOrder =
        Number(a.is_accepted) - Number(b.is_accepted) ||
        Number(Boolean(a.submitted_at)) - Number(Boolean(b.submitted_at));
      if (statusOrder !== 0) return statusOrder;
      return (
        dayjs(a.deadline ?? "9999-12-31").valueOf() -
        dayjs(b.deadline ?? "9999-12-31").valueOf()
      );
    });
  }, [assignedPromptsQ.data, assignedUseCasesQ.data]);

  const libraryItems = useMemo<LibraryItem[]>(() => {
    const prompts =
      libraryPromptsQ.data?.list.map((r) => ({
        id: r.id,
        kind: "PROMPT" as const,
        ref_id: r.id,
        href: practiceHref("PROMPT", r.id),
        title: r.name,
        body: r.scenario,
        level_number: r.level.level_number,
        categories: r.categories,
        submission: r.submission
          ? {
              id: r.submission.id,
              deadline: r.submission.deadline as unknown as string | null,
              submitted_at: r.submission.submitted_at as unknown as
                | string
                | null,
              reviewed_at: r.submission.reviewed_at as unknown as string | null,
              is_accepted: r.submission.is_accepted,
            }
          : null,
      })) ?? [];

    const useCases =
      libraryUseCasesQ.data?.list.map((r) => ({
        id: r.id,
        kind: "USE_CASE" as const,
        ref_id: r.id,
        href: practiceHref("USE_CASE", r.id),
        title: r.name,
        body: r.description,
        level_number: r.level.level_number,
        categories: r.categories,
        submission: r.submission
          ? {
              id: r.submission.id,
              deadline: r.submission.deadline as unknown as string | null,
              submitted_at: r.submission.submitted_at as unknown as
                | string
                | null,
              reviewed_at: r.submission.reviewed_at as unknown as string | null,
              is_accepted: r.submission.is_accepted,
            }
          : null,
      })) ?? [];

    return [...prompts, ...useCases].sort((a, b) => {
      if (a.level_number !== b.level_number) {
        return a.level_number - b.level_number;
      }
      return a.title.localeCompare(b.title);
    });
  }, [libraryPromptsQ.data, libraryUseCasesQ.data]);

  const historyItems = useMemo<PracticeItem[]>(() => {
    return (
      submissionsQ.data?.list.map((r) => ({
        id: r.id,
        kind: r.kind,
        ref_id: r.ref_id,
        href: practiceHref(r.kind, r.ref_id),
        title: r.title,
        body: r.body,
        level_number: r.level.level_number,
        categories: r.categories,
        champion_name: r.assigned_by?.full_name ?? null,
        deadline: r.deadline as unknown as string | null,
        message: r.message,
        submitted_at: r.submitted_at as unknown as string | null,
        reviewed_at: r.reviewed_at as unknown as string | null,
        comment: r.comment,
        is_accepted: r.is_accepted,
      })) ?? []
    );
  }, [submissionsQ.data]);

  const pendingAssignedCount = assignedItems.filter(
    (item) => deriveStatus(item) === "PENDING_SUBMIT"
  ).length;

  const isAssignedLoading =
    assignedPromptsQ.isLoading || assignedUseCasesQ.isLoading;
  const assignedError = assignedPromptsQ.error ?? assignedUseCasesQ.error;
  const isLibraryLoading =
    libraryPromptsQ.isLoading || libraryUseCasesQ.isLoading;
  const libraryError = libraryPromptsQ.error ?? libraryUseCasesQ.error;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Latihan Skill"
          desc="Tingkatkan kemampuanmu dengan latihan yang relevan."
        >
          <Link href="/student/skill-practice/create">
            <ButtonAILN type="button" variant="primary" className="shrink-0">
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
            {assignedError ? (
              <AppErrorComponents />
            ) : isAssignedLoading ? (
              <PracticeSkeleton />
            ) : assignedItems.length === 0 ? (
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
                      message={item.message}
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
            {libraryError ? (
              <AppErrorComponents />
            ) : isLibraryLoading ? (
              <PracticeSkeleton />
            ) : libraryItems.length === 0 ? (
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
            {submissionsQ.error ? (
              <AppErrorComponents />
            ) : submissionsQ.isLoading ? (
              <PracticeSkeleton />
            ) : historyItems.length === 0 ? (
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
          ? "border-red-500 text-red-600 dark:border-red-400 dark:text-red-300"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
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

function PracticeSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1"
        />
      ))}
    </div>
  );
}
