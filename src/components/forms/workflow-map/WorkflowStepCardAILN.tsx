"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import WorkflowAttachmentsFieldAILN from "@/components/fields/WorkflowAttachmentsFieldAILN";
import WorkflowFeedbackItemAILN from "@/components/items/WorkflowFeedbackItemAILN";
import { cn } from "@/lib/utils";
import { WORKFLOW_STEP_FIELDS } from "@/lib/workflow-map";
import type { WorkflowAttachment, WorkflowFeedback, WorkflowNodeInput } from "@/apis/workflows";
import { ArrowDown, ArrowUp, Check, Flame, Trash2 } from "lucide-react";

export const workflowStepTitleId = (id: string) => `workflow-step-${id}-title`;

export default function WorkflowStepCardAILN({
  step,
  number,
  feedback,
  attachments,
  canMoveEarlier,
  canMoveLater,
  canDelete,
  onChange,
  onMove,
  onDelete,
  onAddAttachment,
  onRemoveAttachment,
  onUploadingChange,
}: {
  step: WorkflowNodeInput;
  number: number;
  feedback: WorkflowFeedback[];
  attachments: WorkflowAttachment[];
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  canDelete: boolean;
  onChange: (patch: Partial<WorkflowNodeInput>) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onAddAttachment: (attachment: WorkflowAttachment) => void;
  onRemoveAttachment: (index: number) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const fieldId = (field: string) => `workflow-step-${step.id}-${field}`;
  const heading = `Langkah ${number}`;

  return (
    <li
      id={`workflow-step-${step.id}`}
      aria-label={heading}
      className="flex scroll-mt-24 flex-col gap-4 rounded-lg border border-dashboard-border bg-card-1 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{heading}</h3>
        <div className="flex items-center gap-1">
          <ButtonAILN
            variant="ghost"
            size="mediumIcon"
            aria-label={`Pindahkan ${heading} lebih awal`}
            title="Pindahkan lebih awal"
            disabled={!canMoveEarlier}
            onClick={() => onMove(-1)}
          >
            <ArrowUp className="size-3.5" />
          </ButtonAILN>
          <ButtonAILN
            variant="ghost"
            size="mediumIcon"
            aria-label={`Pindahkan ${heading} lebih akhir`}
            title="Pindahkan lebih akhir"
            disabled={!canMoveLater}
            onClick={() => onMove(1)}
          >
            <ArrowDown className="size-3.5" />
          </ButtonAILN>
          <ButtonAILN
            variant="ghost"
            size="mediumIcon"
            aria-label={`Hapus ${heading}`}
            title={canDelete ? "Hapus langkah" : "Tunggu unggahan selesai atau pertahankan minimal 3 langkah"}
            disabled={!canDelete}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </ButtonAILN>
        </div>
      </div>

      <InputAILN
        inputId={workflowStepTitleId(step.id)}
        inputName={WORKFLOW_STEP_FIELDS.title.label}
        inputPlaceholder={WORKFLOW_STEP_FIELDS.title.placeholder}
        value={step.title}
        characterLength={120}
        onInputChange={(title) => onChange({ title })}
        required
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <InputAILN
          inputId={fieldId("source")}
          inputName={WORKFLOW_STEP_FIELDS.source.label}
          inputPlaceholder={WORKFLOW_STEP_FIELDS.source.placeholder}
          value={step.source}
          characterLength={80}
          onInputChange={(source) => onChange({ source })}
        />
        <InputAILN
          inputId={fieldId("tool")}
          inputName={WORKFLOW_STEP_FIELDS.tool.label}
          inputPlaceholder={WORKFLOW_STEP_FIELDS.tool.placeholder}
          value={step.tool}
          characterLength={40}
          onInputChange={(tool) => onChange({ tool })}
        />
        <InputAILN
          inputId={fieldId("minutes")}
          inputName={WORKFLOW_STEP_FIELDS.minutes.label}
          inputPlaceholder={WORKFLOW_STEP_FIELDS.minutes.placeholder}
          inputMode="numeric"
          pattern="[0-9]*"
          value={step.minutes ?? ""}
          characterLength={3}
          trailing={
            <span className="pr-2 text-xs text-muted-foreground">menit</span>
          }
          onInputChange={(raw) => {
            const digits = raw.replace(/\D/g, "");
            onChange({ minutes: digits ? Number(digits) : null });
          }}
        />
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={step.pain_point}
        onClick={() => onChange({ pain_point: !step.pain_point })}
        className={cn(
          "inline-flex min-h-9 items-center gap-2 self-start rounded-lg border px-3 py-1.5 text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevenpreneur-coal dark:focus-visible:outline-white",
          step.pain_point
            ? "border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
            : "border-dashboard-border text-muted-foreground hover:bg-sb-bg hover:text-foreground",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full border",
            step.pain_point
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-sb-text/50",
          )}
        >
          {step.pain_point && <Check className="size-3" />}
        </span>
        <Flame className="size-3.5" aria-hidden />
        Langkah ini paling repot
      </button>

      <div className="flex flex-col gap-2 border-t border-dashboard-border pt-4">
        <span className="text-sm font-medium">Dokumen langkah <span className="font-normal text-muted-foreground">(opsional)</span></span>
        <p className="text-xs leading-5 text-muted-foreground">
          Lampirkan bahan atau contoh dari langkah ini. Samarkan data pribadi dan rahasia sebelum mengunggah.
        </p>
        <WorkflowAttachmentsFieldAILN
          id={`workflow-attachments-${step.id}`}
          attachments={attachments}
          onAdd={onAddAttachment}
          onRemove={onRemoveAttachment}
          onUploadingChange={onUploadingChange}
          compact
        />
      </div>

      {feedback.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-dashboard-border pt-4">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Masukan di langkah ini
          </h4>
          <ul className="flex flex-col gap-2">
            {feedback.map((item) => (
              <WorkflowFeedbackItemAILN key={item.id} feedback={item} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
