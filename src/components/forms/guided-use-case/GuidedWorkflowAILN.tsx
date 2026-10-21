"use client";

import type { GuidedSession, GuidedStep } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedWorkflowItemAILN from "@/components/items/GuidedWorkflowItemAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import { formatDecimal } from "@/lib/format";
import { Loader2, RefreshCw, ShieldAlert, Sparkles, Timer } from "lucide-react";
import { useState } from "react";
import { Accordion } from "radix-ui";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import GuidedProgressGaugeAILN from "@/components/elements/GuidedProgressGaugeAILN";

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
  const [expanded, setExpanded] = useState(String(steps[0]?.id ?? ""));
  const completed = steps.filter((step) => step.is_done).length;
  const skipped = steps.filter(
    (step) => !step.is_done && step.skipped_reason?.trim(),
  ).length;
  const remaining = session?.regenerate_remaining ?? 0;
  const minutesWithout = session?.minutes_without_ai ?? null;
  const minutesWith = session?.estimated_minutes_with_ai ?? null;
  const savedPercent =
    minutesWithout && minutesWith && minutesWithout > minutesWith
      ? Math.round(((minutesWithout - minutesWith) / minutesWithout) * 100)
      : null;

  if (generating) return <GeneratingState />;

  if (!checklist && steps.length === 0)
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
        <ButtonAILN
          variant="student"
          disabled={remaining === 0}
          onClick={() => void onGenerate()}
        >
          <Sparkles className="size-4" />
          Buat workflow
        </ButtonAILN>
        <p className="text-xs text-muted-foreground">
          Sisa kuota: {remaining} kali
        </p>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      {!checklist && (
        <>
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-dashboard-border bg-card-2">
            <div className="p-4">
              <p className="text-xs text-muted-foreground">Cara sekarang</p>
              <p className="mt-1 font-headline text-2xl font-medium">
                {minutesWithout === null ? "—" : formatDecimal(minutesWithout)}{" "}
                <span className="font-sans text-sm font-normal">menit</span>
              </p>
            </div>
            <div className="border-l border-dashboard-border bg-hijau-t/60 p-4 dark:bg-claude/10">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Timer className="size-3.5" />
                Estimasi dengan AI
              </p>
              <p className="mt-1 font-headline text-2xl font-medium text-claude dark:text-lime-bright">
                {minutesWith === null ? "—" : formatDecimal(minutesWith)}{" "}
                <span className="font-sans text-sm font-normal">menit</span>
              </p>
              {savedPercent !== null && (
                <p className="mt-0.5 text-xs text-claude dark:text-lime-bright">
                  ±{savedPercent}% lebih cepat
                </p>
              )}
            </div>
          </div>
          {session?.summary && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {session.summary}
            </p>
          )}
          {session && session.risks.length > 0 && (
            <div className="flex gap-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-950 dark:bg-amber-500/10 dark:text-amber-200">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <ul className="flex flex-col gap-1">
                {session.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
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
            onCommit={(patch) => onStepCommit(step.id, patch)}
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
            disabled={remaining === 0}
          >
            <RefreshCw className="size-3.5" />
            {remaining === 0 ? "Kuota perbaikan habis" : "Perbaiki workflow"}
          </ButtonAILN>
          {showFeedback && remaining > 0 && (
            <div className="flex w-full flex-col gap-3 rounded-lg border border-dashboard-border p-4">
              <TextAreaAILN
                textAreaId="guided-feedback"
                aria-label="Perbaikan workflow"
                value={feedback}
                onTextAreaChange={setFeedback}
                textAreaPlaceholder="Apa yang perlu diubah? Mis. pakai Copilot, bukan ChatGPT."
                textAreaHeight="min-h-24"
                characterLength={2000}
                variant="STUDENT"
              />
              <div className="flex items-center gap-3">
                <ButtonAILN
                  variant="student"
                  size="small"
                  disabled={!feedback.trim()}
                  onClick={async () => {
                    if (await onGenerate(feedback.trim())) {
                      setFeedback("");
                      setShowFeedback(false);
                    }
                  }}
                >
                  <Sparkles className="size-3.5" />
                  Buat ulang
                </ButtonAILN>
                <span className="text-xs text-muted-foreground">
                  Sisa {remaining} kali · checklist akan diganti
                </span>
              </div>
            </div>
          )}
        </div>
      )}
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
