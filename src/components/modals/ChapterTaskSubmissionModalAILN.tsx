"use client";

import type { ChapterTask } from "@/apis/chapter-tasks";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedFileFieldAILN from "@/components/fields/GuidedFileFieldAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import {
  CHAPTER_TASK_NOTE_MAX,
  CHAPTER_TASK_UPLOAD_FOLDER,
} from "@/lib/chapter-task";
import { uploadPublicFile } from "@/lib/supabase";
import { Loader2, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useState, type FormEvent, type RefObject } from "react";
import { toast } from "sonner";

export default function ChapterTaskSubmissionModalAILN({
  task,
  triggerRef,
  onClose,
  onSubmitted,
}: {
  task: ChapterTask;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || submitting) return;

    setSubmitting(true);
    try {
      let proofUrl: string;
      try {
        proofUrl = await uploadPublicFile(file, CHAPTER_TASK_UPLOAD_FOLDER);
      } catch {
        toast.error("Gagal mengunggah bukti. Coba lagi.");
        return;
      }

      const response = await fetch("/api/chapter-tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: task.id,
          proof_url: proofUrl,
          note: note.trim() || null,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(
          response.status === 409
            ? "Tugas ini sudah dikirim dan sedang direview."
            : (body?.message ?? "Gagal mengirim bukti. Coba lagi."),
        );
        return;
      }

      toast.success("Bukti terkirim. Tugasmu sedang direview.");
      onSubmitted();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !submitting) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          className="fixed left-1/2 top-1/2 z-[81] flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-dashboard-border bg-card-1 p-5 shadow-xl outline-none sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="font-headline text-xl font-medium text-gray-950 dark:text-white">
                Kirim bukti pengerjaan
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[13px] leading-6 text-gray-600 dark:text-gray-400">
                {task.name}
              </Dialog.Description>
            </div>
            <ButtonAILN
              variant="ghost"
              size="icon"
              disabled={submitting}
              onClick={onClose}
              aria-label="Tutup modal kirim bukti"
            >
              <X className="size-4" />
            </ButtonAILN>
          </div>

          <form
            onSubmit={(event) => void submit(event)}
            className="mt-5 space-y-5"
          >
            <GuidedFileFieldAILN
              id={`chapter-task-proof-${task.id}`}
              file={file}
              onChange={setFile}
              outcome
            />
            <TextAreaAILN
              textAreaId={`chapter-task-note-${task.id}`}
              textAreaName="Catatan (opsional)"
              textAreaPlaceholder="Tambahkan konteks untuk reviewer."
              characterLength={CHAPTER_TASK_NOTE_MAX}
              value={note}
              disabled={submitting}
              onTextAreaChange={setNote}
              rows={3}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <ButtonAILN
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={onClose}
              >
                Batal
              </ButtonAILN>
              <ButtonAILN
                type="submit"
                variant="dark"
                disabled={!file || submitting}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {submitting ? "Mengirim..." : "Kirim bukti"}
              </ButtonAILN>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
