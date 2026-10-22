"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import { Loader2, Sparkles, X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { RefObject } from "react";

export default function ImproveGuidedWorkflowModalAILN({
  open,
  onClose,
  feedback,
  onFeedbackChange,
  generating,
  onSubmit,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  feedback: string;
  onFeedbackChange: (value: string) => void;
  generating: boolean;
  onSubmit: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value && !generating) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          className="fixed left-1/2 top-1/2 z-[81] flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-lg border border-dashboard-border bg-card-1 p-6 shadow-xl outline-none"
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="text-lg font-medium">
              Perbaiki workflow
            </Dialog.Title>
            <ButtonAILN
              variant="ghost"
              size="icon"
              disabled={generating}
              onClick={onClose}
              aria-label="Tutup perbaikan workflow"
            >
              <X className="size-4" />
            </ButtonAILN>
          </div>
          <Dialog.Description className="text-sm text-muted-foreground">
            Ceritakan perubahan yang kamu butuhkan. Workflow baru akan mengganti
            langkah dan checklist yang sekarang.
          </Dialog.Description>
          <TextAreaAILN
            textAreaId="guided-feedback"
            textAreaName="Apa yang ingin diperbaiki?"
            value={feedback}
            onTextAreaChange={onFeedbackChange}
            textAreaPlaceholder="Mis. gunakan Copilot dan buat langkah pengecekan angka lebih detail."
            textAreaHeight="min-h-32"
            characterLength={2000}
            variant="STUDENT"
            disabled={generating}
          />
          {generating && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" />
              AI sedang memperbaiki workflow…
            </p>
          )}
          <div className="flex justify-end gap-2">
            <ButtonAILN variant="ghost" disabled={generating} onClick={onClose}>
              Batal
            </ButtonAILN>
            <ButtonAILN
              variant="student"
              disabled={generating || !feedback.trim()}
              onClick={onSubmit}
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {generating ? "Memperbaiki…" : "Perbaiki workflow"}
            </ButtonAILN>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
