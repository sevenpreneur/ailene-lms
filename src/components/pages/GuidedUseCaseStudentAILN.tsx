"use client";

import type { GuidedSession, UseCaseDetail } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import RecordUseCaseButtonAILN from "@/components/buttons/RecordUseCaseButtonAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import { GUIDED_FREQUENCIES, GUIDED_STAGES } from "@/lib/guided-use-case";
import { formatDecimal } from "@/lib/format";
import { useProjectId } from "@/lib/use-project-id";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardList,
  FileText,
  Layers,
  Sparkles,
  Timer,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

dayjs.locale("id");

type Status = "IN_PROGRESS" | "AWAITING_REVIEW" | "NEEDS_REVISION" | "ACCEPTED";

const STATUS_META: Record<
  Status,
  { label: string; variant: GeneralLabelVariantAILN }
> = {
  IN_PROGRESS: { label: "Sedang dikerjakan", variant: "yellow" },
  AWAITING_REVIEW: { label: "Menunggu review", variant: "blue" },
  NEEDS_REVISION: { label: "Perlu revisi", variant: "red" },
  ACCEPTED: { label: "Diterima", variant: "green" },
};

function deriveStatus(useCase: UseCaseDetail): Status {
  if (useCase.is_accepted) return "ACCEPTED";
  if (!useCase.submitted_at) return "IN_PROGRESS";
  if (
    useCase.reviewed_at &&
    dayjs(useCase.reviewed_at).isAfter(dayjs(useCase.submitted_at))
  ) {
    return "NEEDS_REVISION";
  }
  return "AWAITING_REVIEW";
}

export default function GuidedUseCaseStudentAILN({
  useCase,
  session,
  championName,
}: {
  useCase: UseCaseDetail;
  session: GuidedSession;
  championName: string | null;
}) {
  const projectId = useProjectId();
  const status = deriveStatus(useCase);
  const meta = STATUS_META[status];
  const submitted = session.status === "submitted";
  const current = submitted ? 7 : session.current_step;
  const deadline = useCase.deadline_at ? dayjs(useCase.deadline_at) : null;
  const overdue = !!deadline && !submitted && deadline.isBefore(dayjs());
  const done = session.steps.filter((step) => step.is_done).length;

  const cta =
    status === "NEEDS_REVISION"
      ? "Perbarui & kirim ulang"
      : submitted
        ? "Lihat hasil"
        : session.current_step <= 4 && session.steps.length === 0
          ? "Mulai buat workflow"
          : "Lanjutkan";

  return (
    <PageContainerAILN>
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <Link
          href={`/${projectId}/student/skill-practice`}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Use Case
        </Link>

        <section className="relative overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-hijau-t blur-3xl dark:bg-claude/20"
          />
          <div className="relative flex flex-col gap-5 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <GeneralLabelAILN
                variant="green"
                icon={<Sparkles className="h-3 w-3" />}
              >
                Guided
              </GeneralLabelAILN>
              <GeneralLabelAILN
                variant="white"
                icon={<Layers className="h-3 w-3" />}
              >
                Level {useCase.level_number}
              </GeneralLabelAILN>
              {useCase.categories.map((category) => (
                <GeneralLabelAILN key={category.id} variant="white">
                  {category.name}
                </GeneralLabelAILN>
              ))}
              <GeneralLabelAILN variant={meta.variant}>
                {meta.label}
              </GeneralLabelAILN>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-headline text-2xl font-medium tracking-tight sm:text-3xl">
                {useCase.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {championName && (
                  <span className="flex items-center gap-1.5">
                    <UserRoundCheck className="size-4" />
                    Disiapkan oleh {championName}
                  </span>
                )}
                {deadline && (
                  <span
                    className={cn(
                      "flex items-center gap-1.5",
                      overdue && "text-destructive",
                    )}
                  >
                    <CalendarClock className="size-4" />
                    {overdue ? "Lewat deadline" : "Deadline"}{" "}
                    {deadline.format("D MMM YYYY, HH:mm")}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-4" />+{useCase.xp_reward} XP
                </span>
              </div>
            </div>

            <ol className="grid grid-cols-6 gap-1.5" aria-label="Progres">
              {GUIDED_STAGES.map((stage, index) => {
                const step = index + 1;
                const complete = step < current;
                const active = step === current;
                return (
                  <li key={stage.title} className="flex min-w-0 flex-col gap-2">
                    <span
                      className={cn(
                        "h-1.5 rounded-full",
                        complete
                          ? "bg-claude dark:bg-lime-bright"
                          : active
                            ? "bg-claude/40 dark:bg-lime-bright/40"
                            : "bg-card-2",
                      )}
                    />
                    <span
                      className={cn(
                        "hidden truncate text-[11px] sm:block",
                        active || complete
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {complete && <Check className="mr-1 inline size-3" />}
                      {stage.title}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {submitted
                  ? `${done} dari ${session.steps.length} langkah AI sudah kamu coba.`
                  : session.steps.length > 0
                    ? `Workflow siap. ${done} dari ${session.steps.length} langkah selesai.`
                    : "Langkah 1–3 sudah terisi. Tinggal buat workflow AI dan coba di pekerjaanmu."}
              </p>
              {!submitted && session.steps.length === 0 ? (
                <RecordUseCaseButtonAILN
                  projectId={projectId}
                  useCaseId={useCase.id}
                  useCaseName={useCase.name}
                  championName={championName}
                  initialSession={session}
                >
                  {cta}
                  <ArrowRight className="size-4" />
                </RecordUseCaseButtonAILN>
              ) : (
                <ButtonAILN asChild variant="lime" size="medium">
                  <Link
                    href={`/${projectId}/student/skill-practice/guided?use_case_id=${useCase.id}`}
                  >
                    {cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </ButtonAILN>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Yang sudah disiapkan</h2>
            <span className="text-xs text-muted-foreground">Langkah 1–3</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <PrefillCard
              icon={<ClipboardList className="size-4" />}
              step={1}
              title="Pekerjaan harian"
              meta={
                GUIDED_FREQUENCIES.find(
                  (item) => item.value === session.frequency,
                )?.label
              }
              body={session.daily_task}
            />
            <PrefillCard
              icon={<FileText className="size-4" />}
              step={2}
              title="Contoh"
              meta={session.example_file_url ? "Ada lampiran" : undefined}
              body={session.example_text}
            />
            <PrefillCard
              icon={<Timer className="size-4" />}
              step={3}
              title="Proses sekarang"
              meta={
                session.minutes_without_ai !== null
                  ? `${formatDecimal(session.minutes_without_ai)} menit`
                  : undefined
              }
              body={session.current_process}
            />
          </div>
        </section>
      </div>
    </PageContainerAILN>
  );
}

function PrefillCard({
  icon,
  step,
  title,
  meta,
  body,
}: {
  icon: ReactNode;
  step: number;
  title: string;
  meta?: string;
  body: string | null;
}) {
  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-lg border border-dashboard-border bg-card-1 p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">Langkah {step}</p>
          <p className="truncate text-sm font-medium">{title}</p>
        </div>
        {meta && (
          <span className="shrink-0 rounded-full bg-card-2 px-2 py-0.5 text-[11px] text-muted-foreground">
            {meta}
          </span>
        )}
      </div>
      <p className="line-clamp-5 whitespace-pre-wrap break-words text-sm text-muted-foreground">
        {body || "—"}
      </p>
    </article>
  );
}
