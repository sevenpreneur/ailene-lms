"use client";

import type { GuidedTestimonial, UseCaseType } from "@/apis/use-cases";
import GuidedFileFieldAILN from "@/components/fields/GuidedFileFieldAILN";
import InputAILN from "@/components/fields/InputAILN";
import NumberInputAILN from "@/components/fields/NumberInputAILN";
import RatingScaleAILN from "@/components/fields/RatingScaleAILN";
import SelectAILN from "@/components/fields/SelectAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import { GUIDED_TYPES, isGuidedProofLink } from "@/lib/guided-use-case";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import { Loader2 } from "lucide-react";

export type GuidedEvidence = GuidedTestimonial & {
  name: string;
  outcome_proof: string;
  hours_with_ai: string;
  ai_tool: string;
  type: UseCaseType | null;
  description: string;
};

export default function GuidedEvidenceAILN({
  value,
  onChange,
  file,
  onFileChange,
  onLinkChange,
  minutesWithoutAi,
  showName,
  uploading,
}: {
  value: GuidedEvidence;
  onChange: (patch: Partial<GuidedEvidence>) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onLinkChange: (url: string) => void;
  minutesWithoutAi: number | null;
  showName: boolean;
  uploading: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      {showName && (
        <InputAILN
          inputId="guided-name"
          inputName="Judul use case (opsional)"
          inputType="text"
          inputPlaceholder="Mis. Rekap laporan penjualan mingguan"
          value={value.name}
          onInputChange={(name) => onChange({ name })}
          characterLength={255}
          variant="STUDENT"
        />
      )}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Bukti hasil</p>
          <GuidedHintAILN label="Tentang bukti hasil">
            Pilih file atau tautan yang bisa dibuka Champion. Samarkan data
            sensitif terlebih dahulu.
          </GuidedHintAILN>
        </div>
        <GuidedFileFieldAILN
          id="guided-outcome-file"
          file={file}
          onChange={onFileChange}
          outcome
        />
        {uploading && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Mengunggah file…
          </p>
        )}
        <InputAILN
          characterLength={500}
          inputId="guided-outcome-link"
          aria-label="Tautan bukti hasil"
          inputType="url"
          inputPlaceholder="Atau tempel tautan: https://…"
          value={file ? "" : value.outcome_proof}
          onInputChange={(outcome_proof) => {
            onLinkChange(outcome_proof);
          }}
          errorMessage={
            !file &&
            value.outcome_proof &&
            !isGuidedProofLink(value.outcome_proof)
              ? "Gunakan tautan lengkap dengan https:// atau http://."
              : undefined
          }
          variant="STUDENT"
        />
      </div>
      <div className="flex items-center justify-between rounded-lg bg-card-2 px-3 py-1.5 text-xs">
        <span className="text-muted-foreground">
          Tanpa AI{" "}
          <span className="ml-2 font-medium text-foreground">
            {minutesWithoutAi ?? "—"} menit
          </span>
        </span>
        <GuidedHintAILN label="Tentang waktu">
          Durasi untuk satu kali pengerjaan. Penghematan waktu dihitung otomatis
          setelah kamu mengirim.
        </GuidedHintAILN>
      </div>
      <NumberInputAILN
        inputId="guided-hours-with"
        inputName="Durasi dengan AI (jam)"
        inputConfig="decimal"
        inputPlaceholder="Contoh: 0,5"
        value={value.hours_with_ai}
        onInputChange={(hours_with_ai) => onChange({ hours_with_ai })}
        variant="STUDENT"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <InputAILN
          inputId="guided-ai-tool"
          inputName="AI tool"
          inputType="text"
          value={value.ai_tool}
          onInputChange={(ai_tool) => onChange({ ai_tool })}
          variant="STUDENT"
          required
        />
        <SelectAILN
          selectId="guided-type"
          selectName="Tipe use case"
          selectPlaceholder="Pilih tipe"
          value={value.type}
          options={GUIDED_TYPES}
          onChange={(type) => onChange({ type: type as UseCaseType | null })}
          variant="STUDENT"
          required
        />
      </div>
      <TextAreaAILN
        textAreaId="guided-description"
        textAreaName="Hasil"
        textAreaPlaceholder="Apa yang berhasil kamu buat?"
        textAreaHeight="min-h-28"
        characterLength={5000}
        value={value.description}
        onTextAreaChange={(description) => onChange({ description })}
        variant="STUDENT"
        required
      />
      <TextAreaAILN
        textAreaId="guided-testimonial"
        textAreaName="Pengalamanmu"
        textAreaPlaceholder="Apa yang membantu? Apa yang masih perlu diperbaiki?"
        textAreaHeight="min-h-32"
        characterLength={5000}
        value={value.testimonial}
        onTextAreaChange={(testimonial) => onChange({ testimonial })}
        variant="STUDENT"
        required
      />
      <p className="-mt-3 text-xs text-muted-foreground">
        {value.testimonial.trim().length} karakter · min. 50
      </p>
      <RatingScaleAILN
        id="guided-rating"
        question="Seberapa membantu?"
        lowLabel="Belum membantu"
        highLabel="Sangat membantu"
        value={value.helpfulness_rating}
        onChange={(helpfulness_rating) => onChange({ helpfulness_rating })}
      />
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={value.share_consent}
          onChange={(event) =>
            onChange({ share_consent: event.target.checked })
          }
          className="mt-0.5 size-4 shrink-0 accent-claude"
        />
        <span>Boleh dibagikan di Use Case Library</span>
      </label>
    </div>
  );
}
