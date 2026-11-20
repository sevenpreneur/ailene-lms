"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import { formatFileSize } from "@/lib/format";
import { compressImage } from "@/lib/image-compression";
import { uploadPublicFile } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  WORKFLOW_ATTACHMENT_FOLDER,
  WORKFLOW_ATTACHMENT_MAX_MB,
  WORKFLOW_ATTACHMENT_TYPES,
  WORKFLOW_MAX_ATTACHMENTS,
} from "@/lib/workflow-map";
import type { WorkflowAttachment } from "@/apis/workflows";
import {
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Paperclip,
  Presentation,
  X,
} from "lucide-react";
import { useEffect, useState, type DragEvent } from "react";
import { toast } from "sonner";

const MAX_BYTES = WORKFLOW_ATTACHMENT_MAX_MB * 1024 * 1024;
// Photos may start larger because they shrink before upload.
const MAX_RAW_IMAGE_BYTES = 40 * 1024 * 1024;
const ACCEPT = Object.keys(WORKFLOW_ATTACHMENT_TYPES)
  .map((extension) => `.${extension}`)
  .join(",");

type Upload = { key: string; name: string; stage: "compress" | "upload" };

function iconFor(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return FileSpreadsheet;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return Presentation;
  return FileText;
}

export default function WorkflowAttachmentsFieldAILN({
  id,
  attachments,
  onAdd,
  onRemove,
  onUploadingChange,
  compact = false,
}: {
  id: string;
  attachments: WorkflowAttachment[];
  onAdd: (attachment: WorkflowAttachment) => void;
  onRemove: (index: number) => void;
  onUploadingChange: (uploading: boolean) => void;
  compact?: boolean;
}) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const remaining =
    WORKFLOW_MAX_ATTACHMENTS - attachments.length - uploads.length;
  const full = remaining <= 0;

  useEffect(() => {
    onUploadingChange(uploads.length > 0);
  }, [uploads.length, onUploadingChange]);

  const setStage = (key: string, stage: Upload["stage"]) =>
    setUploads((current) =>
      current.map((item) => (item.key === key ? { ...item, stage } : item)),
    );

  const uploadOne = async (original: File, key: string) => {
    const extension = original.name.split(".").pop()?.toLowerCase() ?? "";
    const isImage = WORKFLOW_ATTACHMENT_TYPES[extension]?.startsWith("image/");
    let file = original;
    if (isImage) {
      try {
        file = await compressImage(original);
      } catch {
        file = original;
      }
    }
    if (file.size > MAX_BYTES) {
      toast.error(
        `${original.name} lebih dari ${WORKFLOW_ATTACHMENT_MAX_MB} MB.`,
      );
      return;
    }
    setStage(key, "upload");
    try {
      const url = await uploadPublicFile(file, WORKFLOW_ATTACHMENT_FOLDER);
      onAdd({
        node_id: null,
        url,
        name: file.name,
        mime_type:
          file === original ? WORKFLOW_ATTACHMENT_TYPES[extension] : file.type,
        size_bytes: file.size,
      });
    } catch {
      toast.error(`${original.name} gagal diunggah. Coba lagi.`);
    }
  };

  const addFiles = (files: File[]) => {
    if (files.length === 0) return;
    if (files.length > remaining) {
      toast.error(`Maksimal ${WORKFLOW_MAX_ATTACHMENTS} file.`);
    }
    for (const file of files.slice(0, Math.max(remaining, 0))) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const type = WORKFLOW_ATTACHMENT_TYPES[extension];
      if (!type) {
        toast.error(`Format ${file.name} tidak didukung.`);
        continue;
      }
      const limit = type.startsWith("image/") ? MAX_RAW_IMAGE_BYTES : MAX_BYTES;
      if (file.size === 0 || file.size > limit) {
        toast.error(
          `${file.name} kosong atau lebih dari ${WORKFLOW_ATTACHMENT_MAX_MB} MB.`,
        );
        continue;
      }
      const key = crypto.randomUUID();
      setUploads((current) => [
        ...current,
        {
          key,
          name: file.name,
          stage: type.startsWith("image/") ? "compress" : "upload",
        },
      ]);
      void uploadOne(file, key).finally(() =>
        setUploads((current) => current.filter((item) => item.key !== key)),
      );
    }
  };

  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!full) addFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-center transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sevenpreneur-coal dark:focus-within:outline-white",
          compact ? "min-h-20 p-3" : "min-h-32 p-5",
          full
            ? "cursor-not-allowed border-sb-border bg-sb-bg/50 text-muted-foreground"
            : "cursor-pointer border-sb-border bg-sb-bg hover:border-sevenpreneur-coal/40 dark:hover:border-white/40",
          dragging && "border-sevenpreneur-coal dark:border-white",
        )}
      >
        <Paperclip className="size-5" aria-hidden />
        <span className="text-sm font-medium">
          {full
            ? `Sudah ${WORKFLOW_MAX_ATTACHMENTS} file`
            : compact ? "Unggah dokumen langkah" : "Pilih file atau tarik ke sini"}
        </span>
        <span id={`${id}-help`} className="text-xs text-muted-foreground">
          PDF, Word, Excel, PowerPoint, atau gambar · maks.{" "}
          {WORKFLOW_MAX_ATTACHMENTS} file · {WORKFLOW_ATTACHMENT_MAX_MB} MB per
          file. Foto dikompres otomatis.
        </span>
        <input
          id={id}
          type="file"
          multiple
          accept={ACCEPT}
          disabled={full}
          aria-describedby={`${id}-help`}
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            addFiles(files);
          }}
        />
      </label>

      {(attachments.length > 0 || uploads.length > 0) && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {attachments.map((attachment, index) => {
            const Icon = iconFor(attachment.mime_type);
            return (
              <li
                key={attachment.url}
                className="flex items-center gap-3 rounded-lg border border-dashboard-border bg-card-1 px-3 py-2"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-sb-border bg-sb-bg text-sb-text-strong">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm hover:underline"
                  >
                    {attachment.name}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size_bytes)}
                  </span>
                </span>
                <ButtonAILN
                  variant="ghost"
                  size="mediumIcon"
                  aria-label={`Hapus ${attachment.name}`}
                  title="Hapus file"
                  onClick={() => onRemove(index)}
                >
                  <X className="size-3.5" />
                </ButtonAILN>
              </li>
            );
          })}
          {uploads.map((upload) => (
            <li
              key={upload.key}
              className="flex items-center gap-3 rounded-lg border border-dashed border-dashboard-border px-3 py-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{upload.name}</span>
              <span className="text-xs">
                {upload.stage === "compress" ? "Mengompres…" : "Mengunggah…"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
