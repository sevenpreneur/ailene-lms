"use client";

import GuidedProgressGaugeAILN from "@/components/elements/GuidedProgressGaugeAILN";
import { Check, Lock } from "lucide-react";
import { Popover } from "radix-ui";
import { useState } from "react";
import { GUIDED_STAGES } from "@/lib/guided-use-case";
import { cn } from "@/lib/utils";

export default function GuidedUseCaseStepperAILN({
  currentStep,
  furthestStep,
  onStepChange,
  maxStep = 6,
}: {
  currentStep: number;
  furthestStep: number;
  onStepChange: (step: number) => void;
  maxStep?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Pilih langkah, ${currentStep} dari ${maxStep}`}
          className="rounded-full transition hover:bg-card-2 focus-visible:outline-2 focus-visible:outline-claude"
        >
          <GuidedProgressGaugeAILN
            value={currentStep}
            total={maxStep}
            label="Langkah panduan"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-[80] w-60 rounded-lg border border-dashboard-border bg-card-1 p-2 shadow-xl"
        >
          <nav aria-label="Langkah panduan use case">
            <ol>
              {GUIDED_STAGES.slice(0, maxStep).map((stage, index) => {
                const step = index + 1;
                const active = step === currentStep;
                const locked = step > furthestStep;
                return (
                  <li key={stage.title}>
                    <button
                      type="button"
                      disabled={locked}
                      aria-current={active ? "step" : undefined}
                      aria-label={`Langkah ${step}: ${stage.title}`}
                      onClick={() => {
                        onStepChange(step);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition focus-visible:outline-2 focus-visible:outline-claude disabled:cursor-not-allowed disabled:opacity-40",
                        active
                          ? "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright"
                          : "hover:bg-card-2",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full",
                          active ? "bg-claude text-white" : "bg-card-2",
                        )}
                      >
                        {locked ? (
                          <Lock className="size-3" aria-label="Terkunci" />
                        ) : step < furthestStep && !active ? (
                          <Check className="size-3.5" />
                        ) : (
                          step
                        )}
                      </span>
                      <span className="font-medium">{stage.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
