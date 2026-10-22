"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import { useRef } from "react";
import { AlertDialog } from "radix-ui";
interface AlertConfirmDialogAILNProps {
  isOpen: boolean;
  alertDialogHeader: string;
  alertDialogMessage: string;
  alertCancelLabel: string;
  alertConfirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}
export default function AlertConfirmDialogAILN({
  isOpen,
  alertDialogHeader,
  alertDialogMessage,
  alertCancelLabel,
  alertConfirmLabel,
  onClose,
  onConfirm,
}: AlertConfirmDialogAILNProps) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <AlertDialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[80] bg-black/40 dark:bg-black/70" />
        <AlertDialog.Content
          onOpenAutoFocus={() => {
            previousFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            previousFocus.current?.focus();
          }}
          className="fixed left-1/2 top-1/2 z-[81] flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-lg border border-dashboard-border bg-card-1 p-6 shadow-lg outline-none"
        >
          <AlertDialog.Title className="text-lg font-medium">
            {alertDialogHeader}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            {alertDialogMessage}
          </AlertDialog.Description>
          <div className="flex flex-wrap justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <ButtonAILN variant="neutral" onClick={onClose}>
                {alertCancelLabel}
              </ButtonAILN>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <ButtonAILN onClick={onConfirm}>{alertConfirmLabel}</ButtonAILN>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
