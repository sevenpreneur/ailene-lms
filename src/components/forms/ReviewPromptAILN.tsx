"use client";
import DisabledActionButtonAILN from "@/components/buttons/DisabledActionButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import AppPageState from "@/components/states/AppPageState";
import { getPromptSubmissionDetailMock } from "@/mock-data/champion";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { CalendarClock, Clock, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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
  | "rubric_specificity"
  | "rubric_context"
  | "rubric_constraints"
  | "rubric_examples"
  | "rubric_iteration";

const RUBRIC: { key: RubricKey; label: string }[] = [
  { key: "rubric_specificity", label: "Spesifik" },
  { key: "rubric_context", label: "Konteks" },
  { key: "rubric_constraints", label: "Batasan (Constraints)" },
  { key: "rubric_examples", label: "Contoh (Few-shot)" },
  { key: "rubric_iteration", label: "Iterasi" },
];

const fmt = (d: string | Date) =>
  dayjs(d).locale("id").format("ddd, D MMM YYYY · HH:mm");

export default function ReviewPromptAILN({
  submissionId,
}: {
  submissionId: number;
}) {
  const s = getPromptSubmissionDetailMock({ submission_id: submissionId });

  const [comment, setComment] = useState("");
  const [rubric, setRubric] = useState<Record<RubricKey, number | null>>({
    rubric_specificity: null,
    rubric_context: null,
    rubric_constraints: null,
    rubric_examples: null,
    rubric_iteration: null,
  });

  useEffect(() => {
    if (!s) return;
    queueMicrotask(() => {
      setComment(s.comment ?? "");
      setRubric({
        rubric_specificity: s.rubric_specificity ?? null,
        rubric_context: s.rubric_context ?? null,
        rubric_constraints: s.rubric_constraints ?? null,
        rubric_examples: s.rubric_examples ?? null,
        rubric_iteration: s.rubric_iteration ?? null,
      });
    });
  }, [s]);

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
              <DisabledActionButtonAILN type="button" variant="destructive">
                <RotateCcw className="size-4" />
                Minta Revisi
              </DisabledActionButtonAILN>
              <DisabledActionButtonAILN type="button" variant="champion">
                Terima Submission
              </DisabledActionButtonAILN>
            </>
          )}
        </PageHeaderAILN>

        {/* Labels */}
        <div className="flex flex-wrap items-center gap-1.5">
          <GeneralLabelAILN variant="yellow">Prompt</GeneralLabelAILN>
          <GeneralLabelAILN variant="blue">
            Level {s.prompt.level.level_number}
          </GeneralLabelAILN>
          {s.prompt.categories.map((c) => (
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
            desc="Skor rubric 1–5 dan catatan untuk student."
            className="self-start xl:sticky xl:top-6"
            contentClassName="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-3">
              {RUBRIC.map((r) => (
                <RubricRow
                  key={r.key}
                  label={r.label}
                  value={rubric[r.key]}
                  disabled={!canReview}
                  onChange={(n) =>
                    setRubric((prev) => ({ ...prev, [r.key]: n }))
                  }
                />
              ))}
            </div>

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
  disabled,
  onChange,
}: {
  label: string;
  value: number | null;
  disabled: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
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
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
