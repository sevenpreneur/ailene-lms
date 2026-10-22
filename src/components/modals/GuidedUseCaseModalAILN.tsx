"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import { Sparkles, X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode, RefObject } from "react";

export default function GuidedUseCaseModalAILN({
  onClose,
  triggerRef,
  children,
  progress,
  title,
}: {
  onClose: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
  progress: ReactNode;
  title: string;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[71] flex h-[min(700px,94dvh)] w-[calc(100%-1rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-dashboard-border bg-card-1 shadow-2xl outline-none sm:w-[calc(100%-3rem)]"
          onPointerDownOutside={(event) => event.preventDefault()}
          onCloseAutoFocus={
            triggerRef
              ? (event) => {
                  event.preventDefault();
                  triggerRef.current?.focus();
                }
              : undefined
          }
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-dashboard-border px-5 py-3 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0">
                <Dialog.Title className="line-clamp-1 text-sm font-medium">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
                  Isi langkah 1–3. Setelah AI selesai membuat workflow,
                  lanjutkan langkah 4–6 di halaman.
                </Dialog.Description>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {progress}
              <ButtonAILN
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Tutup catat use case"
              >
                <X className="size-5" />
              </ButtonAILN>
            </div>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
