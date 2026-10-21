"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import { FileUp, X } from "lucide-react";
import { toast } from "sonner";

export default function GuidedFileFieldAILN({
  id,
  file,
  onChange,
  outcome = false,
}: {
  id: string;
  file: File | null;
  onChange: (file: File | null) => void;
  outcome?: boolean;
}) {
  const extensions = outcome
    ? ["pdf", "png", "jpg", "jpeg", "mp4"]
    : ["pdf", "docx", "xlsx", "csv", "png", "jpg", "jpeg"];
  const maxMb = outcome ? 20 : 10;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-dashboard-border bg-card-2/50 p-4 focus-within:ring-1 focus-within:ring-claude">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="flex flex-1 cursor-pointer items-center gap-3 py-2 text-sm font-medium"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-card-1">
            <FileUp className="size-4 text-claude dark:text-lime-bright" />
          </span>
          <span>
            Pilih file
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Maks. {maxMb} MB
            </span>
          </span>
        </label>
        <GuidedHintAILN label="Format file">
          {extensions.join(", ").toUpperCase()}. Maksimal {maxMb} MB. File langsung
          diunggah setelah dipilih.
        </GuidedHintAILN>
      </div>
      <p id={`${id}-help`} className="sr-only">
        {extensions.join(", ").toUpperCase()} · Maksimal {maxMb} MB. File langsung
        diunggah setelah dipilih.
      </p>
      <input
        id={id}
        type="file"
        accept={extensions.map((ext) => `.${ext}`).join(",")}
        aria-describedby={`${id}-help`}
        className="sr-only"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          if (!selected) return;
          const extension = selected.name.split(".").pop()?.toLowerCase() ?? "";
          if (!extensions.includes(extension)) {
            toast.error("Format file tidak didukung.");
            return;
          }
          if (selected.size === 0 || selected.size > maxMb * 1024 * 1024) {
            toast.error(`Pilih file yang tidak kosong, maksimal ${maxMb} MB.`);
            return;
          }
          onChange(selected);
        }}
      />
      {file && (
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0 break-all">{file.name} </span>
          <ButtonAILN
            variant="ghost"
            size="icon"
            onClick={() => onChange(null)}
            aria-label="Hapus pilihan file"
          >
            <X className="size-4" />
          </ButtonAILN>
        </div>
      )}
    </div>
  );
}
