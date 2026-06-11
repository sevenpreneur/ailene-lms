"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  History,
  Library,
  Loader2,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

dayjs.locale("id");

type PracticeTab = "ASSIGNED" | "LIBRARY" | "HISTORY";
type PracticeKind = "PROMPT" | "USE_CASE";

type PracticeStatus =
  | "PENDING_SUBMIT"
  | "AWAITING_REVIEW"
  | "NEEDS_REVISION"
  | "ACCEPTED";

interface Category {
  id: number;
  name: string;
}

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
    ? `/student/practice/prompts/${refId}`
    : `/student/practice/use-cases/${refId}`;
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

const statusMeta: Record<
  PracticeStatus,
  { label: string; cls: string; icon: typeof CheckCircle2 }
> = {
  PENDING_SUBMIT: {
    label: "Belum dikerjakan",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 dark:border dark:border-amber-500/30",
    icon: Clock,
  },
  AWAITING_REVIEW: {
    label: "Menunggu review",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 dark:border dark:border-blue-500/30",
    icon: Clock,
  },
  NEEDS_REVISION: {
    label: "Perlu revisi",
    cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300 dark:border dark:border-red-500/30",
    icon: CircleAlert,
  },
  ACCEPTED: {
    label: "Diterima",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border dark:border-emerald-500/30",
    icon: CheckCircle2,
  },
};

export default function PracticeStudentAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const [tab, setTab] = useState<PracticeTab>(() =>
    tabFromParam(searchParams.get("tab"))
  );
  const [startingKey, setStartingKey] = useState<string | null>(null);

  useEffect(() => {
    setTab(tabFromParam(searchParams.get("tab")));
  }, [searchParams]);

  const assignedPromptsQ = trpc.ailene.list.assignedPrompts.useQuery();
  const assignedUseCasesQ = trpc.ailene.list.assignedUseCases.useQuery();
  const libraryPromptsQ = trpc.ailene.list.memberPromptLibrary.useQuery(
    undefined,
    { enabled: tab === "LIBRARY" }
  );
  const libraryUseCasesQ = trpc.ailene.list.memberUseCaseLibrary.useQuery(
    undefined,
    { enabled: tab === "LIBRARY" }
  );
  const submissionsQ = trpc.ailene.list.practiceSubmissions.useQuery(
    undefined,
    { enabled: tab === "HISTORY" }
  );

  const selfAssignPromptM = trpc.ailene.create.selfAssignPrompt.useMutation();
  const selfAssignUseCaseM =
    trpc.ailene.create.selfAssignUseCase.useMutation();

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
              reviewed_at: r.submission.reviewed_at as unknown as
                | string
                | null,
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
              reviewed_at: r.submission.reviewed_at as unknown as
                | string
                | null,
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

  const handleStartLibrary = (item: LibraryItem) => {
    const key = `${item.kind}:${item.ref_id}`;
    setStartingKey(key);
    const onSuccess = () => {
      utils.ailene.list.memberPromptLibrary.invalidate();
      utils.ailene.list.memberUseCaseLibrary.invalidate();
      router.push(item.href);
    };
    const onError = (err: { message: string }) => {
      toast.error("Gagal membuka latihan", { description: err.message });
    };
    const onSettled = () => setStartingKey(null);

    if (item.kind === "PROMPT") {
      selfAssignPromptM.mutate(
        { prompt_id: item.ref_id },
        { onSuccess, onError, onSettled }
      );
      return;
    }

    selfAssignUseCaseM.mutate(
      { use_case_id: item.ref_id },
      { onSuccess, onError, onSettled }
    );
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground dark:text-white">
              Latihan Skill
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tingkatkan kemampuanmu dengan latihan yang relevan.
            </p>
          </div>
          <ButtonAILN
            type="button"
            variant="primary"
            className="shrink-0"
            onClick={() => router.push("/student/practice/create")}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Tambah Latihan</span>
          </ButtonAILN>
        </div>

        <div className="overflow-x-auto">
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
                    <PracticeCard
                      key={`${item.kind}-${item.id}`}
                      item={item}
                      mode="assigned"
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
                  <LibraryCard
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    isStarting={startingKey === `${item.kind}:${item.ref_id}`}
                    onStart={() => handleStartLibrary(item)}
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
                  <PracticeCard
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    mode="history"
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
      className={`-mb-px inline-flex h-12 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${
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

function PracticeCard({
  item,
  mode,
}: {
  item: PracticeItem;
  mode: "assigned" | "history";
}) {
  const status = deriveStatus(item);
  const ctaLabel =
    status === "ACCEPTED"
      ? "Lihat Detail"
      : status === "NEEDS_REVISION"
        ? "Revisi"
        : status === "AWAITING_REVIEW"
          ? "Lihat Submission"
          : "Kerjakan";

  return (
    <BasePracticeCard
      kind={item.kind}
      title={item.title}
      body={item.body}
      levelNumber={item.level_number}
      categories={item.categories}
      status={status}
      deadline={item.deadline}
      championName={item.champion_name}
      message={mode === "assigned" ? item.message : null}
      submittedAt={mode === "history" ? item.submitted_at : null}
      href={item.href}
      ctaLabel={ctaLabel}
    />
  );
}

function LibraryCard({
  item,
  isStarting,
  onStart,
}: {
  item: LibraryItem;
  isStarting: boolean;
  onStart: () => void;
}) {
  const status = deriveStatus(
    item.submission ?? {
      submitted_at: null,
      reviewed_at: null,
      is_accepted: false,
    }
  );
  const hasSubmission = Boolean(item.submission);
  const ctaLabel = !hasSubmission
    ? "Mulai"
    : status === "ACCEPTED"
      ? "Lihat Detail"
      : status === "NEEDS_REVISION"
        ? "Revisi"
        : status === "AWAITING_REVIEW"
          ? "Lihat Submission"
          : "Lanjutkan";

  return (
    <BasePracticeCard
      kind={item.kind}
      title={item.title}
      body={item.body}
      levelNumber={item.level_number}
      categories={item.categories}
      status={status}
      deadline={item.submission?.deadline ?? null}
      championName={null}
      message={null}
      submittedAt={item.submission?.submitted_at ?? null}
      href={hasSubmission ? item.href : null}
      ctaLabel={ctaLabel}
      onClick={!hasSubmission ? onStart : undefined}
      isLoading={isStarting}
    />
  );
}

function BasePracticeCard({
  kind,
  title,
  body,
  levelNumber,
  categories,
  status,
  deadline,
  championName,
  message,
  submittedAt,
  href,
  ctaLabel,
  onClick,
  isLoading,
}: {
  kind: PracticeKind;
  title: string;
  body: string;
  levelNumber: number;
  categories: Category[];
  status: PracticeStatus;
  deadline: string | null;
  championName: string | null;
  message: string | null;
  submittedAt: string | null;
  href: string | null;
  ctaLabel: string;
  onClick?: () => void;
  isLoading?: boolean;
}) {
  const meta = statusMeta[status];
  const StatusIcon = meta.icon;
  const deadlineOverdue =
    status === "PENDING_SUBMIT" &&
    deadline !== null &&
    dayjs(deadline).isBefore(dayjs());

  return (
    <article className="flex min-h-64 flex-col gap-4 rounded-lg border border-dashboard-border bg-white p-4 transition hover:border-red-300 hover:shadow-sm dark:bg-card-1">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-red-50 px-2 py-0.5 font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
            L{levelNumber}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 font-semibold text-gray-700 dark:bg-white/5 dark:text-gray-300">
            {kind === "PROMPT" ? "Prompt" : "Use Case"}
          </span>
          {categories.slice(0, 2).map((category) => (
            <span
              key={category.id}
              className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700 dark:bg-white/5 dark:text-gray-300"
            >
              {category.name}
            </span>
          ))}
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.cls}`}
        >
          <StatusIcon className="size-3" />
          {meta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-base font-bold text-foreground dark:text-white">
          {title}
        </h3>
        <p className="text-sm leading-6 text-gray-500 line-clamp-3 dark:text-gray-400">
          {body}
        </p>
      </div>

      <div className="flex flex-col gap-1 border-t border-dashboard-border pt-3 text-xs text-gray-600 dark:text-gray-300">
        {deadline && (
          <div className="flex items-center gap-2">
            <CalendarClock className="size-3.5 shrink-0" />
            <span
              className={
                deadlineOverdue
                  ? "font-semibold text-red-600 dark:text-red-400"
                  : ""
              }
            >
              Deadline: {dayjs(deadline).format("ddd, D MMM YYYY - HH:mm")}
              {deadlineOverdue ? " (lewat)" : ""}
            </span>
          </div>
        )}
        {submittedAt && (
          <div className="flex items-center gap-2">
            <Send className="size-3.5 shrink-0" />
            <span>
              Submitted: {dayjs(submittedAt).format("ddd, D MMM YYYY - HH:mm")}
            </span>
          </div>
        )}
        {championName && (
          <div className="flex items-center gap-2">
            <BookOpen className="size-3.5 shrink-0" />
            <span>Dari: {championName}</span>
          </div>
        )}
        {message && (
          <div className="flex items-start gap-2">
            <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
            <span className="italic line-clamp-2">&ldquo;{message}&rdquo;</span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {href ? (
          <Link
            href={href}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-dashboard-border bg-light-background px-3 text-sm font-semibold text-light-foreground transition hover:bg-light-hover active:scale-95 dark:bg-dashboard-bg dark:text-white dark:hover:bg-card-1"
          >
            {ctaLabel}
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <ButtonAILN
            type="button"
            variant="outline"
            size="medium"
            onClick={onClick}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {ctaLabel}
            {!isLoading ? <ChevronRight className="size-4" /> : null}
          </ButtonAILN>
        )}
      </div>
    </article>
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
