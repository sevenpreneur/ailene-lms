"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import SelectAILN from "@/components/fields/SelectAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import WorkflowFeedbackItemAILN from "@/components/items/WorkflowFeedbackItemAILN";
import { GUIDED_FREQUENCIES } from "@/lib/guided-use-case";
import { cn } from "@/lib/utils";
import {
  WORKFLOW_NODE_LABELS,
  WORKFLOW_NODE_QUESTIONS,
  WORKFLOW_TOOL_PRESETS,
} from "@/lib/workflow-map";
import type { WorkflowFeedback, WorkflowNodeInput } from "@/apis/workflows";
import { ArrowDown, ArrowUp, Check, Flame, Trash2 } from "lucide-react";
import { forwardRef } from "react";

export const WORKFLOW_TITLE_INPUT_ID = "workflow-node-title";

const WorkflowInspectorAILN = forwardRef<
  HTMLElement,
  {
    node: WorkflowNodeInput;
    stepNumber: number | null;
    feedback: WorkflowFeedback[];
    canMoveEarlier: boolean;
    canMoveLater: boolean;
    canDelete: boolean;
    onChange: (patch: Partial<WorkflowNodeInput>) => void;
    onMove: (direction: -1 | 1) => void;
    onDelete: () => void;
  }
>(function WorkflowInspectorAILN(
  {
    node,
    stepNumber,
    feedback,
    canMoveEarlier,
    canMoveLater,
    canDelete,
    onChange,
    onMove,
    onDelete,
  },
  ref,
) {
  const question = WORKFLOW_NODE_QUESTIONS[node.kind];
  const heading = `${WORKFLOW_NODE_LABELS[node.kind]}${stepNumber ? ` ${stepNumber}` : ""}`;

  return (
    <section
      ref={ref}
      aria-label={`Detail ${heading}`}
      className="flex scroll-mt-20 flex-col rounded-lg border border-dashboard-border bg-card-1 shadow-xs"
    >
      <header className="flex items-center justify-between gap-3 border-b border-dashboard-border px-4 py-3">
        <h2 className="text-sm font-medium">{heading}</h2>
        {node.kind === "step" && (
          <div className="flex items-center gap-1">
            <ButtonAILN
              variant="ghost"
              size="mediumIcon"
              aria-label="Pindahkan lebih awal"
              title="Pindahkan lebih awal"
              disabled={!canMoveEarlier}
              onClick={() => onMove(-1)}
            >
              <ArrowUp className="size-3.5" />
            </ButtonAILN>
            <ButtonAILN
              variant="ghost"
              size="mediumIcon"
              aria-label="Pindahkan lebih akhir"
              title="Pindahkan lebih akhir"
              disabled={!canMoveLater}
              onClick={() => onMove(1)}
            >
              <ArrowDown className="size-3.5" />
            </ButtonAILN>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-5 p-4">
        <InputAILN
          inputId={WORKFLOW_TITLE_INPUT_ID}
          inputName={question.label}
          inputPlaceholder={question.placeholder}
          value={node.title}
          characterLength={120}
          onInputChange={(title) => onChange({ title })}
          required
        />

        {node.kind === "trigger" && (
          <SelectAILN
            selectId="workflow-node-frequency"
            selectName="Seberapa sering?"
            selectPlaceholder="Pilih frekuensi"
            value={node.frequency}
            options={GUIDED_FREQUENCIES}
            onChange={(frequency) =>
              onChange({
                frequency: frequency as WorkflowNodeInput["frequency"],
              })
            }
          />
        )}

        {node.kind === "step" && (
          <>
            <div className="flex flex-col gap-2">
              <InputAILN
                inputId="workflow-node-tool"
                inputName="Pakai alat apa?"
                inputPlaceholder="Mis. Excel"
                value={node.tool}
                characterLength={40}
                onInputChange={(tool) => onChange({ tool })}
              />
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label="Pilihan alat cepat"
              >
                {WORKFLOW_TOOL_PRESETS.map((tool) => (
                  <ButtonAILN
                    key={tool}
                    variant={node.tool === tool ? "chipActive" : "chip"}
                    size="chip"
                    aria-pressed={node.tool === tool}
                    onClick={() => onChange({ tool })}
                  >
                    {tool}
                  </ButtonAILN>
                ))}
              </div>
            </div>

            <InputAILN
              inputId="workflow-node-minutes"
              inputName="Perkiraan waktu"
              inputPlaceholder="0"
              inputMode="numeric"
              pattern="[0-9]*"
              value={node.minutes ?? ""}
              characterLength={3}
              hint="Dalam menit, untuk sekali jalan."
              trailing={
                <span className="pr-2 text-xs text-muted-foreground">
                  menit
                </span>
              }
              onInputChange={(raw) => {
                const digits = raw.replace(/\D/g, "");
                onChange({ minutes: digits ? Number(digits) : null });
              }}
            />

            <button
              type="button"
              role="switch"
              aria-checked={node.pain_point}
              onClick={() => onChange({ pain_point: !node.pain_point })}
              className={cn(
                "flex min-h-11 items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevenpreneur-coal dark:focus-visible:outline-white",
                node.pain_point
                  ? "border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
                  : "border-dashboard-border hover:bg-sb-bg",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                  node.pain_point
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-sb-text/50",
                )}
              >
                {node.pain_point && <Check className="size-3" aria-hidden />}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Flame className="size-3.5" aria-hidden />
                  Langkah ini paling repot
                </span>
                <span className="text-xs leading-5 text-muted-foreground">
                  Makan waktu, sering salah, atau membosankan.
                </span>
              </span>
            </button>
          </>
        )}

        {node.kind === "output" && (
          <InputAILN
            inputId="workflow-node-recipient"
            inputName="Diserahkan ke siapa?"
            inputPlaceholder="Mis. Kepala Area"
            value={node.recipient}
            characterLength={60}
            onInputChange={(recipient) => onChange({ recipient })}
          />
        )}

        <TextAreaAILN
          textAreaId="workflow-node-note"
          textAreaName="Catatan"
          textAreaPlaceholder="Kendala, pengecualian, atau hal yang ingin ditanyakan di kelas."
          value={node.note}
          rows={3}
          characterLength={500}
          onTextAreaChange={(note) => onChange({ note })}
        />

        {feedback.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-dashboard-border pt-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Masukan di kartu ini
            </h3>
            <ul className="flex flex-col gap-2">
              {feedback.map((item) => (
                <WorkflowFeedbackItemAILN key={item.id} feedback={item} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {node.kind === "step" && (
        <footer className="border-t border-dashboard-border px-4 py-3">
          <ButtonAILN
            variant="ghost"
            size="small"
            disabled={!canDelete}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
            Hapus langkah
          </ButtonAILN>
        </footer>
      )}
    </section>
  );
});

export default WorkflowInspectorAILN;
