"use client";

import type { GuidedStep } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import LogError from "@/lib/log-error";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Clock,
  Copy,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";

export default function GuidedStepCardAILN({
  step,
  embedded = false,
}: {
  step: GuidedStep;
  embedded?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const promptId = useId();

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(step.prompt_template);
      setCopied(true);
    } catch (error) {
      void LogError("GuidedStepCardAILN.copyPrompt", error);
      toast.error(
        "Prompt belum bisa disalin. Pilih teks prompt lalu salin secara manual.",
      );
    }
  }

  return (
    <article
      className={cn(
        "min-w-0",
        !embedded &&
          "rounded-lg border border-dashboard-border bg-card-1 p-4 sm:p-5",
      )}
    >
      {!embedded && (
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-hijau-t text-sm font-medium text-claude dark:bg-claude/15 dark:text-lime-bright">
            {step.order}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h3 className="font-medium">{step.title}</h3>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Wrench className="size-3.5" />
                {step.suggested_tool}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />±{step.estimated_minutes} menit
              </span>
            </div>
          </div>
        </div>
      )}
      <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
        {step.instruction}
      </p>
      {step.prompt_template && (
        <div className="mt-4 rounded-lg border border-dashboard-border bg-card-2 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowPrompt((value) => !value)}
              aria-expanded={showPrompt}
              aria-controls={promptId}
              className="inline-flex items-center gap-2 rounded-lg text-xs font-medium focus-visible:outline-2 focus-visible:outline-claude"
            >
              Lihat prompt
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  showPrompt && "rotate-180",
                )}
              />
            </button>
            <ButtonAILN
              variant="outline"
              size="small"
              onClick={copyPrompt}
              aria-label={`Salin prompt: ${step.title}`}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span aria-live="polite">
                {copied ? "Tersalin" : "Salin prompt"}
              </span>
            </ButtonAILN>
          </div>
          <p
            id={promptId}
            hidden={!showPrompt}
            className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed"
          >
            {step.prompt_template}
          </p>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCheck className="size-4 shrink-0 text-claude dark:text-lime-bright" />
        <span>Cek hasil</span>
        <GuidedHintAILN label={`Cara cek: ${step.title}`}>
          {step.verification}
        </GuidedHintAILN>
      </div>
    </article>
  );
}
