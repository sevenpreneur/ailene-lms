"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import { Sparkles, X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode, RefObject } from "react";

export default function GuidedUseCaseModalAILN({
  isOpen,
  onClose,
  triggerRef,
  children,
  progress,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
  progress: ReactNode;
  title: string;
}) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[71] flex h-[min(700px,94dvh)] w-[calc(100%-1rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-dashboard-border bg-card-1 shadow-2xl outline-none sm:w-[calc(100%-3rem)] motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95"
          onPointerDownOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("guided-heading")?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-dashboard-border px-5 py-3 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright">
                <Sparkles className="size-4" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Dialog.Title className="line-clamp-1 text-sm font-medium">
                    {title}
                  </Dialog.Title>
                </div>
                <Dialog.Description className="sr-only">
                  Catat use case dalam enam langkah. Draft isian tersimpan di
                  browser ini. Proses juga disimpan ke server setiap pindah
                  langkah.
                </Dialog.Description>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {progress}
              <GuidedHintAILN label="Tentang penyimpanan">
                Draft isian tersimpan di browser ini untuk akunmu, bukan lintas
                perangkat. Pindah langkah juga menyimpan intake dan proses ke
                server. Tunggu unggahan selesai sebelum menutup.
              </GuidedHintAILN>
              <Dialog.Close asChild>
                <ButtonAILN
                  variant="ghost"
                  size="icon"
                  aria-label="Tutup catat use case"
                >
                  <X className="size-5" />
                </ButtonAILN>
              </Dialog.Close>
            </div>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
