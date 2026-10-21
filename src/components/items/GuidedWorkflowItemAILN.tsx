"use client";

import type { GuidedStep } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedStepCardAILN from "@/components/cards/GuidedStepCardAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import { Check, ChevronDown, ArrowRight, SkipForward } from "lucide-react";
import { Accordion } from "radix-ui";

export default function GuidedWorkflowItemAILN({
  step,
  checklist,
  onChange,
  onNext,
}: {
  step: GuidedStep;
  checklist: boolean;
  onChange: (patch: Partial<GuidedStep>) => void;
  onNext?: () => void;
}) {
  const skipped = !step.is_done && !!step.skipped_reason?.trim();

  return (
    <Accordion.Item
      value={String(step.id)}
      className="overflow-hidden rounded-lg border border-dashboard-border bg-card-1"
    >
      <div className="flex items-center gap-3 px-4">
        {checklist && (
          <input
            type="checkbox"
            checked={step.is_done}
            aria-label={`Saya sudah menjalankan langkah ${step.order} dan mengecek hasilnya`}
            onChange={(event) =>
              onChange({ is_done: event.target.checked, skipped_reason: null })
            }
            className="size-4 shrink-0 cursor-pointer accent-claude"
          />
        )}
        <Accordion.Header className="min-w-0 flex-1">
          <Accordion.Trigger className="group flex w-full items-center gap-3 py-4 text-left focus-visible:outline-2 focus-visible:outline-claude">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-hijau-t text-xs font-medium text-claude dark:bg-claude/15 dark:text-lime-bright">
              {step.is_done ? (
                <Check className="size-4" />
              ) : skipped ? (
                <SkipForward className="size-3.5" />
              ) : (
                step.order
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{step.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {step.suggested_tool} · ±{step.estimated_minutes} menit
                {checklist &&
                  (step.is_done ? " · Selesai" : skipped ? " · Dilewati" : "")}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </Accordion.Trigger>
        </Accordion.Header>
      </div>
      <Accordion.Content className="border-t border-dashboard-border">
        <div className="flex flex-col gap-4 p-4">
          <GuidedStepCardAILN step={step} embedded />
          {checklist && (
            <div className="flex flex-col gap-3 rounded-lg bg-card-2 p-3">
              <TextAreaAILN
                textAreaId={`guided-note-${step.id}`}
                textAreaName="Catatan (opsional)"
                value={step.note ?? ""}
                onTextAreaChange={(note) => onChange({ note })}
                textAreaHeight="min-h-20"
                characterLength={2000}
                variant="STUDENT"
              />
              {!step.is_done && (
                <TextAreaAILN
                  textAreaId={`guided-skip-${step.id}`}
                  textAreaName="Alasan dilewati"
                  value={step.skipped_reason ?? ""}
                  onTextAreaChange={(skipped_reason) =>
                    onChange({ skipped_reason })
                  }
                  textAreaPlaceholder="Kenapa langkah ini dilewati?"
                  textAreaHeight="min-h-20"
                  characterLength={2000}
                  variant="STUDENT"
                />
              )}
              <ButtonAILN
                variant="outline"
                size="small"
                onClick={() => {
                  onChange({ is_done: true, skipped_reason: null });
                  onNext?.();
                }}
              >
                <Check className="size-3.5" />
                {onNext ? "Selesai & lanjut" : "Tandai selesai"}
              </ButtonAILN>
            </div>
          )}
          {!checklist && onNext && (
            <div className="flex justify-end">
              <ButtonAILN variant="textAccent" size="small" onClick={onNext}>
                Berikutnya
                <ArrowRight className="size-3.5" />
              </ButtonAILN>
            </div>
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
