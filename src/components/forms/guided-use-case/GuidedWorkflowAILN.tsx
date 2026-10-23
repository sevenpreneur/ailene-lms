"use client";

import type { GuidedSession, GuidedStep } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import GuidedProgressGaugeAILN from "@/components/elements/GuidedProgressGaugeAILN";
import GuidedWorkflowPreviewAILN from "@/components/forms/guided-use-case/GuidedWorkflowPreviewAILN";
import GuidedWorkflowItemAILN from "@/components/items/GuidedWorkflowItemAILN";
import ImproveGuidedWorkflowModalAILN from "@/components/modals/ImproveGuidedWorkflowModalAILN";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Accordion } from "radix-ui";
import { useRef, useState } from "react";

export default function GuidedWorkflowAILN({
  session,
  steps,
  checklist,
  generating,
  onGenerate,
  onStepChange,
  onStepCommit,
}: {
  session: GuidedSession | null;
  steps: GuidedStep[];
  checklist: boolean;
  generating: boolean;
  onGenerate: (feedback?: string) => Promise<boolean>;
  onStepChange: (id: number, patch: Partial<GuidedStep>) => void;
  onStepCommit: (id: number, patch: Partial<GuidedStep>) => void;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const improveTriggerRef = useRef<HTMLButtonElement>(null);
  const workflowKey = steps.map((step) => step.id).join("-");
  const [expansion, setExpansion] = useState({
    workflowKey,
    value: String(steps[0]?.id ?? ""),
  });
  const expanded =
    expansion.workflowKey === workflowKey
      ? expansion.value
      : String(steps[0]?.id ?? "");
  const setExpanded = (value: string) => setExpansion({ workflowKey, value });
  const completed = steps.filter((step) => step.is_done).length;
  const skipped = steps.filter(
    (step) => !step.is_done && step.skipped_reason?.trim(),
  ).length;

  if (!checklist) {
    if (steps.length === 0 && !generating)
      return (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-dashboard-border bg-card-2/50 px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright">
            <Sparkles className="size-5" />
          </span>
          <div className="max-w-sm">
            <p className="font-headline text-lg font-medium">
              Susun workflow dari jawabanmu
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              AI membaca pekerjaan, contoh, dan proses yang sudah diisi, lalu
              menyusun 3–7 langkah lengkap dengan prompt dan cara mengeceknya.
            </p>
          </div>
          <ButtonAILN variant="primary" onClick={() => void onGenerate()}>
            <Sparkles className="size-4" />
            Buat workflow
          </ButtonAILN>
        </div>
      );

    return (
      <>
        <GuidedWorkflowPreviewAILN
          session={session}
          steps={steps}
          loading={generating ? <GeneratingState /> : undefined}
          action={
            <ButtonAILN
              ref={improveTriggerRef}
              variant="outline"
              size="small"
              onClick={() => setShowFeedback(true)}
              aria-haspopup="dialog"
              aria-expanded={showFeedback}
              disabled={generating}
            >
              <RefreshCw className="size-3.5" />
              Perbaiki workflow
            </ButtonAILN>
          }
        />
        <ImproveGuidedWorkflowModalAILN
          triggerRef={improveTriggerRef}
          open={showFeedback}
          onClose={() => setShowFeedback(false)}
          feedback={feedback}
          onFeedbackChange={setFeedback}
          generating={generating}
          onSubmit={() => {
            void onGenerate(feedback.trim()).then((success) => {
              if (success) {
                setFeedback("");
                setShowFeedback(false);
              }
            });
          }}
        />
      </>
    );
  }

  if (generating) return <GeneratingState />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-lg bg-card-2/60 px-4 py-3">
        <GuidedProgressGaugeAILN
          value={completed}
          total={steps.length}
          label="Langkah selesai"
          large
        />
        <div className="flex-1">
          <p className="text-sm font-medium" aria-live="polite">
            {completed} dari {steps.length} langkah selesai
          </p>
          {skipped > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {skipped} dilewati
            </p>
          )}
        </div>
        <GuidedHintAILN label="Tentang checklist">
          Centang setelah mengecek hasilnya. Jika melewati langkah, isi
          alasannya. Setiap perubahan langsung tersimpan.
        </GuidedHintAILN>
      </div>
      <Accordion.Root
        type="single"
        collapsible
        value={expanded}
        onValueChange={setExpanded}
        className="flex flex-col gap-3"
      >
        {steps.map((step, index) => (
          <GuidedWorkflowItemAILN
            key={step.id}
            step={step}
            checklist
            onChange={(patch) => onStepChange(step.id, patch)}
            onCommit={(patch) => onStepCommit(step.id, patch)}
            onNext={
              index < steps.length - 1
                ? () => setExpanded(String(steps[index + 1].id))
                : undefined
            }
          />
        ))}
      </Accordion.Root>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="flex flex-col gap-4" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3 rounded-lg bg-hijau-t/70 px-4 py-3 text-sm text-claude dark:bg-claude/10 dark:text-lime-bright">
        <Loader2 className="size-4 animate-spin" />
        AI sedang menyusun workflow untukmu. Biasanya kurang dari satu menit.
      </div>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-lg border border-dashboard-border p-4"
        >
          <span className="size-7 shrink-0 animate-pulse rounded-full bg-card-2" />
          <div className="flex flex-1 flex-col gap-2">
            <span className="h-3 w-2/3 animate-pulse rounded-full bg-card-2" />
            <span className="h-2.5 w-1/3 animate-pulse rounded-full bg-card-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
