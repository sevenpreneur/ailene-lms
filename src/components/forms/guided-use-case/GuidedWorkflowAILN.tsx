"use client";

import type { GuidedSession, GuidedStep } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import DisabledActionButtonAILN from "@/components/buttons/DisabledActionButtonAILN";
import GuidedWorkflowItemAILN from "@/components/items/GuidedWorkflowItemAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import { GUIDED_MOCK_REASON } from "@/lib/guided-use-case";
import { formatDecimal } from "@/lib/format";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Accordion } from "radix-ui";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import GuidedProgressGaugeAILN from "@/components/elements/GuidedProgressGaugeAILN";

export default function GuidedWorkflowAILN({
  sample,
  steps,
  onLoadSample,
  checklist,
  onStepChange,
}: {
  sample: GuidedSession;
  steps: GuidedStep[];
  onLoadSample: () => void;
  checklist: boolean;
  onStepChange: (id: number, patch: Partial<GuidedStep>) => void;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [expanded, setExpanded] = useState(String(steps[0]?.id ?? 1));
  const completed = steps.filter((step) => step.is_done).length;
  const skipped = steps.filter(
    (step) => !step.is_done && step.skipped_reason?.trim(),
  ).length;

  return (
    <div className="flex flex-col gap-5">
      {!checklist && (
        <>
          {steps.length === 0 && (
            <div className="flex flex-wrap gap-2">
              <DisabledActionButtonAILN
                variant="student"
                reason={GUIDED_MOCK_REASON}
              >
                Buat workflow
              </DisabledActionButtonAILN>
              {steps.length === 0 && (
                <ButtonAILN variant="student" onClick={onLoadSample}>
                  <Eye className="size-4" />
                  Lihat contoh
                </ButtonAILN>
              )}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Contoh · Rekap penjualan</span>
            <GuidedHintAILN label="Tentang contoh workflow">
              Contoh tetap, belum disesuaikan dengan jawabanmu.{" "}
              {sample.risks.join(" ")}
            </GuidedHintAILN>
          </div>
        </>
      )}
      {steps.length > 0 && (
        <>
          {!checklist && (
            <>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-dashboard-border bg-card-2 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Manual</p>
                  <p className="mt-1 font-headline text-2xl font-medium">
                    {sample.minutes_without_ai === null
                      ? "—"
                      : formatDecimal(sample.minutes_without_ai)}{" "}
                    <span className="font-sans text-sm font-normal">menit</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dengan AI</p>
                  <p className="mt-1 font-headline text-2xl font-medium text-claude dark:text-lime-bright">
                    {sample.estimated_minutes_with_ai === null
                      ? "—"
                      : formatDecimal(sample.estimated_minutes_with_ai)}{" "}
                    <span className="font-sans text-sm font-normal">menit</span>
                  </p>
                </div>
              </div>
            </>
          )}
          {checklist && (
            <div className="flex items-center gap-3 rounded-lg bg-card-2/60 px-4 py-3">
              <GuidedProgressGaugeAILN
                value={completed}
                total={steps.length}
                label="Langkah selesai"
                large
              />
              <div className="flex-1">
                <p className="text-sm font-medium" aria-live="polite">
                  Selesai
                </p>
                {skipped > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {skipped} dilewati
                  </p>
                )}
              </div>
              <GuidedHintAILN label="Tentang checklist">
                Centang setelah mengecek hasilnya. Jika melewati langkah, isi
                alasannya. Perubahan masih lokal.
              </GuidedHintAILN>
            </div>
          )}
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
                checklist={checklist}
                onChange={(patch) => onStepChange(step.id, patch)}
                onNext={
                  index < steps.length - 1
                    ? () => setExpanded(String(steps[index + 1].id))
                    : undefined
                }
              />
            ))}
          </Accordion.Root>
          {!checklist && (
            <div className="flex flex-col items-start gap-3">
              <ButtonAILN
                variant="textAccent"
                onClick={() => setShowFeedback(!showFeedback)}
                aria-expanded={showFeedback}
              >
                Perbaiki
              </ButtonAILN>
              {showFeedback && (
                <div className="flex w-full flex-col gap-3">
                  <TextAreaAILN
                    textAreaId="guided-feedback"
                    aria-label="Perbaikan workflow"
                    value={feedback}
                    onTextAreaChange={setFeedback}
                    textAreaPlaceholder="Apa yang perlu diubah?"
                    textAreaHeight="min-h-24"
                    characterLength={2000}
                    variant="STUDENT"
                  />
                  <div className="flex items-center gap-2">
                    <DisabledActionButtonAILN reason={GUIDED_MOCK_REASON}>
                      Buat ulang
                    </DisabledActionButtonAILN>
                    <GuidedHintAILN label="Kuota perbaikan">
                      Sisa kuota contoh: {sample.regenerate_remaining} kali.
                      Perbaikan tersedia setelah backend terhubung.
                    </GuidedHintAILN>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
