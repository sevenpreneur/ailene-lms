"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import AppPageState from "@/components/states/AppPageState";
import type {
  PromptEvaluation,
  PromptSubmissionDetails,
} from "@/apis/champion";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  Loader2,
  Pencil,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useProjectId } from "@/lib/use-project-id";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

type Status =
  | "PENDING_SUBMIT"
  | "AWAITING_REVIEW"
  | "NEEDS_REVISION"
  | "ACCEPTED";

const STATUS_META: Record<
  Status,
  { label: string; variant: GeneralLabelVariantAILN }
> = {
  PENDING_SUBMIT: { label: "Belum dikerjakan", variant: "yellow" },
  AWAITING_REVIEW: { label: "Perlu review", variant: "blue" },
  NEEDS_REVISION: { label: "Menunggu revisi student", variant: "red" },
  ACCEPTED: { label: "Diterima", variant: "green" },
};

type RubricKey =
  | "specificity"
  | "context"
  | "constraints"
  | "examples"
  | "iteration";

const RUBRIC: { key: RubricKey; label: string }[] = [
  { key: "specificity", label: "Spesifik" },
  { key: "context", label: "Konteks" },
  { key: "constraints", label: "Batasan (Constraints)" },
  { key: "examples", label: "Contoh (Few-shot)" },
  { key: "iteration", label: "Iterasi" },
];

const NO_OVERRIDES: Record<RubricKey, number | null> = {
  specificity: null,
  context: null,
  constraints: null,
  examples: null,
  iteration: null,
};

// AI grading usually lands within seconds; the cap keeps a stuck job from refreshing forever.
const AI_POLL_INTERVAL_MS = 3000;
const AI_POLL_MAX_ATTEMPTS = 20;

const fmt = (d: string | Date) =>
  dayjs(d).locale("id").format("ddd, D MMM YYYY · HH:mm");

function hasScores(evaluation: PromptEvaluation | null) {
  return RUBRIC.some((r) => evaluation?.[r.key] != null);
}

export default function ReviewPromptAILN({
  detail,
}: {
  detail: PromptSubmissionDetails | null;
}) {
  const s = detail;
  const projectId = useProjectId();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState(s?.comment ?? "");
  const [overrides, setOverrides] = useState(NO_OVERRIDES);
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);

  // Polling refreshes `detail`, so only reset the form for a new submission or review.
  const formKey = s ? `${s.id}:${s.submitted_at}:${s.reviewed_at}` : "";
  const [prevFormKey, setPrevFormKey] = useState(formKey);
  if (formKey !== prevFormKey) {
    setPrevFormKey(formKey);
    setComment(s?.comment ?? "");
    setOverrides(NO_OVERRIDES);
    setIsEditingScores(false);
    setPollAttempts(0);
  }

  const evaluation = s?.evaluation ?? null;
  const isAiPending = evaluation?.ai_status === "pending";

  useEffect(() => {
    if (!isAiPending || pollAttempts >= AI_POLL_MAX_ATTEMPTS) return;
    const timer = setTimeout(() => {
      setPollAttempts((n) => n + 1);
      router.refresh();
    }, AI_POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [isAiPending, pollAttempts, router]);

  const status: Status = useMemo(() => {
    if (!s) return "PENDING_SUBMIT";
    if (s.is_accepted) return "ACCEPTED";
    if (!s.submitted_at) return "PENDING_SUBMIT";
    if (s.reviewed_at && dayjs(s.reviewed_at).isAfter(dayjs(s.submitted_at)))
      return "NEEDS_REVISION";
    return "AWAITING_REVIEW";
  }, [s]);

  if (!s) {
    return (
      <PageContainerAILN>
        <AppPageState variant="NOT_FOUND" />
      </PageContainerAILN>
    );
  }

  const submitReview = async (isAccepted: boolean) => {
    if (isSubmitting || !s) return;
    if (!isAccepted && !comment.trim()) {
      toast.error("Isi catatan revisi dulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/champion/prompts/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          submission_id: s.id,
          is_accepted: isAccepted,
          comment: comment.trim() || null,
          // Only corrected dimensions are sent; the backend keeps the AI's score for the rest.
          ...Object.fromEntries(
            RUBRIC.filter((r) => overrides[r.key] !== null).map((r) => [
              `rubric_${r.key}`,
              overrides[r.key],
            ]),
          ),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.message ?? "Gagal menyimpan review.");
        return;
      }

      toast.success(
        isAccepted
          ? `Submission diterima · +${payload?.xp_awarded ?? 0} XP`
          : "Dikembalikan untuk revisi.",
      );
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const meta = STATUS_META[status];
  const canReview = status === "AWAITING_REVIEW" || status === "NEEDS_REVISION";
  const deadline = s.deadline;
  const submittedAt = s.submitted_at;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title={s.prompt.name}
          desc={`Review submission dari ${s.member.full_name}`}
        >
          {canReview && (
            <>
              <ButtonAILN
                type="button"
                variant="destructive"
                onClick={() => submitReview(false)}
                disabled={isSubmitting}
              >
                <RotateCcw className="size-4" />
                Minta Revisi
              </ButtonAILN>
              <ButtonAILN
                type="button"
                variant="champion"
                onClick={() => submitReview(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan…" : "Terima Submission"}
              </ButtonAILN>
            </>
          )}
        </PageHeaderAILN>

        {/* Labels */}
        <div className="flex flex-wrap items-center gap-1.5">
          <GeneralLabelAILN variant="yellow">Prompt</GeneralLabelAILN>
          <GeneralLabelAILN variant="blue">
            Level {s.prompt.level?.level_number ?? "-"}
          </GeneralLabelAILN>
          {s.categories.map((c) => (
            <GeneralLabelAILN key={c.id} variant="white">
              {c.name}
            </GeneralLabelAILN>
          ))}
          <GeneralLabelAILN variant={meta.variant}>
            {meta.label}
          </GeneralLabelAILN>
        </div>

        {/* Member + metadata */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-3">
            <Image
              src={s.member.avatar || DEFAULT_AVATAR}
              alt={s.member.full_name}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-semibold dark:text-white">
                {s.member.full_name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {s.member.email}
              </div>
            </div>
          </div>
          {submittedAt && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="size-3.5 shrink-0" />
              Disubmit: {fmt(submittedAt)}
            </div>
          )}
          {deadline && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <CalendarClock className="size-3.5 shrink-0" />
              Deadline: {fmt(deadline)}
            </div>
          )}
        </div>

        {/* Two panels */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Left: student answer */}
          <div className="flex flex-col gap-6">
            <SectionContainerAILN
              title="Konteks Prompt"
              contentClassName="flex flex-col gap-4"
            >
              <Field label="Skenario" text={s.prompt.scenario} />
              <div className="border-t border-dashboard-border pt-4">
                <Field
                  label="Expected Output"
                  text={s.prompt.expected_output}
                />
              </div>
            </SectionContainerAILN>

            <SectionContainerAILN
              title="Jawaban Student"
              contentClassName="flex flex-col gap-4"
            >
              {submittedAt ? (
                <>
                  <Field label="Prompt yang dia pakai" text={s.input} boxed />
                  <Field label="Output dari AI" text={s.output} boxed />
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Student belum submit.
                </p>
              )}
            </SectionContainerAILN>
          </div>

          {/* Right: assessment */}
          <SectionContainerAILN
            title="Penilaian"
            desc="Skor rubric 1–5 dari AI. Keputusan terima atau revisi tetap di tangan Anda."
            className="self-start xl:sticky xl:top-6"
            contentClassName="flex flex-col gap-5"
          >
            {submittedAt ? (
              <AiAssessment
                evaluation={evaluation}
                overrides={overrides}
                isEditing={isEditingScores || !hasScores(evaluation)}
                canEdit={canReview}
                pollTimedOut={pollAttempts >= AI_POLL_MAX_ATTEMPTS}
                onStartEditing={() => setIsEditingScores(true)}
                onResetOverrides={() => {
                  setOverrides(NO_OVERRIDES);
                  setIsEditingScores(false);
                }}
                onChange={(key, n) =>
                  setOverrides((prev) => ({ ...prev, [key]: n }))
                }
                onUseFeedback={setComment}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Penilaian AI muncul setelah student submit.
              </p>
            )}

            <div className="border-t border-dashboard-border pt-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Catatan Submission
              </div>
              <TextAreaAILN
                textAreaId="review-comment"
                textAreaPlaceholder="Tulis feedback (wajib kalau minta revisi, opsional kalau accept)"
                textAreaHeight="h-28"
                characterLength={2000}
                variant="CHAMPION"
                value={comment}
                onTextAreaChange={setComment}
                disabled={!canReview}
              />
              <div className="mt-1 self-end text-right text-xs text-gray-400">
                {comment.length}/2000
              </div>
            </div>

            {!canReview && s.comment && (
              <div className="rounded-md border border-hijau-t bg-hijau-t p-3 text-sm text-gray-700 dark:border-claude/30 dark:bg-claude/10 dark:text-gray-200">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-claude dark:text-lime-bright">
                  Catatan terakhir
                  {s.reviewed_at &&
                    ` · ${dayjs(s.reviewed_at)
                      .locale("id")
                      .format("D MMM · HH:mm")}`}
                </div>
                {s.comment}
              </div>
            )}
          </SectionContainerAILN>
        </div>
      </div>
    </PageContainerAILN>
  );
}

function AiAssessment({
  evaluation,
  overrides,
  isEditing,
  canEdit,
  pollTimedOut,
  onStartEditing,
  onResetOverrides,
  onChange,
  onUseFeedback,
}: {
  evaluation: PromptEvaluation | null;
  overrides: Record<RubricKey, number | null>;
  isEditing: boolean;
  canEdit: boolean;
  pollTimedOut: boolean;
  onStartEditing: () => void;
  onResetOverrides: () => void;
  onChange: (key: RubricKey, n: number) => void;
  onUseFeedback: (text: string) => void;
}) {
  const aiStatus = evaluation?.ai_status ?? null;

  if (aiStatus === "pending") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-dashboard-border bg-card-2 p-3 text-sm text-muted-foreground">
        {pollTimedOut ? (
          <Clock className="mt-0.5 size-4 shrink-0" />
        ) : (
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />
        )}
        {pollTimedOut
          ? "AI belum selesai menilai. Muat ulang halaman sebentar lagi."
          : "AI sedang menilai prompt student…"}
      </div>
    );
  }

  const hasOverrides = RUBRIC.some((r) => overrides[r.key] !== null);
  const scores = RUBRIC.map(
    (r) => overrides[r.key] ?? evaluation?.[r.key] ?? null,
  );
  const isComplete = scores.every((n) => n !== null);
  // Backend's average is authoritative; only recompute locally while the champion is correcting.
  const average = hasOverrides
    ? isComplete
      ? Math.round(
          (scores.reduce<number>((sum, n) => sum + (n ?? 0), 0) /
            scores.length) *
            10,
        ) / 10
      : null
    : (evaluation?.average ?? null);

  return (
    <div className="flex flex-col gap-4">
      {aiStatus === "failed" && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          AI gagal menilai submission ini. Isi skornya secara manual.
        </div>
      )}

      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Rata-rata
          </div>
          <div className="text-3xl font-bold text-foreground">
            {average !== null ? average.toFixed(1) : "–"}
            <span className="text-base font-medium text-muted-foreground">
              {" "}
              / 5
            </span>
          </div>
        </div>
        {aiStatus === "completed" && (
          <GeneralLabelAILN
            variant={hasOverrides ? "yellow" : "blue"}
            icon={<Sparkles className="size-3" />}
          >
            {hasOverrides ? "AI + koreksi Anda" : "Dinilai AI"}
          </GeneralLabelAILN>
        )}
        {aiStatus === null && hasScores(evaluation) && (
          <GeneralLabelAILN variant="white">Dinilai manual</GeneralLabelAILN>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {RUBRIC.map((r) => (
          <RubricRow
            key={r.key}
            label={r.label}
            value={overrides[r.key] ?? evaluation?.[r.key] ?? null}
            isOverridden={overrides[r.key] !== null}
            disabled={!canEdit || !isEditing}
            onChange={(n) => onChange(r.key, n)}
          />
        ))}
      </div>

      {canEdit && hasScores(evaluation) && (
        <div className="flex justify-end">
          {isEditing ? (
            <button
              type="button"
              onClick={onResetOverrides}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {hasOverrides ? "Kembalikan ke skor AI" : "Batal koreksi"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartEditing}
              className="inline-flex items-center gap-1 text-xs font-medium text-claude underline-offset-2 hover:underline dark:text-lime-bright"
            >
              <Pencil className="size-3" />
              Koreksi skor AI
            </button>
          )}
        </div>
      )}

      {evaluation?.ai_feedback && (
        <div className="flex flex-col gap-2 rounded-md border border-dashboard-border bg-card-2 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="size-3" />
            Feedback AI untuk student
          </div>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {evaluation.ai_feedback}
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => onUseFeedback(evaluation.ai_feedback ?? "")}
              className="self-start text-xs font-medium text-claude underline-offset-2 hover:underline dark:text-lime-bright"
            >
              Pakai sebagai catatan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  text,
  boxed,
}: {
  label: string;
  text: string | null;
  boxed?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <p
        className={`whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200 ${
          boxed ? "rounded-md border border-dashboard-border bg-card-2 p-3" : ""
        }`}
      >
        {text ?? "—"}
      </p>
    </div>
  );
}

function RubricRow({
  label,
  value,
  isOverridden,
  disabled,
  onChange,
}: {
  label: string;
  value: number | null;
  isOverridden: boolean;
  disabled: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">
        {label}
        {isOverridden && (
          <span className="ml-1 text-[11px] font-medium text-amber-600 dark:text-amber-300">
            · dikoreksi
          </span>
        )}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className={`size-7 rounded-md border text-xs font-bold transition ${
              value === n
                ? "border-claude bg-claude text-white"
                : "border-dashboard-border text-gray-500 hover:border-claude dark:text-gray-400"
            } ${disabled ? "cursor-default" : ""}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
