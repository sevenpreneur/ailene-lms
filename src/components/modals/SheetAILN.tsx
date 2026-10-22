"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useRef, type ReactNode } from "react";
interface SheetAILNProps {
  sheetName: string;
  sheetDescription?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}
export default function SheetAILN({
  sheetName,
  sheetDescription,
  isOpen,
  onClose,
  children,
}: SheetAILNProps) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 dark:bg-black/80" />
        <Dialog.Content
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
          className="fixed inset-y-0 right-0 z-[71] flex h-dvh w-full flex-col border-l border-dashboard-border bg-background shadow-lg outline-none sm:max-w-md"
        >
          <header className="relative shrink-0 p-6 pr-14">
            <Dialog.Title className="text-lg font-medium">
              {sheetName}
            </Dialog.Title>
            <Dialog.Description
              className={
                sheetDescription
                  ? "mt-1 text-sm text-muted-foreground"
                  : "sr-only"
              }
            >
              {sheetDescription || sheetName}
            </Dialog.Description>
            <div className="absolute right-3 top-3">
              <Dialog.Close asChild>
                <ButtonAILN
                  variant="ghost"
                  size="icon"
                  aria-label={`Tutup ${sheetName}`}
                >
                  <X className="size-5" />
                </ButtonAILN>
              </Dialog.Close>
            </div>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
