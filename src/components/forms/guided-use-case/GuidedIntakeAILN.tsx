"use client";

import type { GuidedSession } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedFileFieldAILN from "@/components/fields/GuidedFileFieldAILN";
import InputAILN from "@/components/fields/InputAILN";
import NumberInputAILN from "@/components/fields/NumberInputAILN";
import SelectAILN from "@/components/fields/SelectAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import { GUIDED_FREQUENCIES } from "@/lib/guided-use-case";
import type { StakeholderVariant } from "@/lib/app-types";
import { FileUp, Loader2, ShieldCheck, TextCursorInput } from "lucide-react";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import { useState } from "react";

export type GuidedIntake = Pick<
  GuidedSession,
  | "daily_task"
  | "frequency"
  | "example_text"
  | "sensitive_data_confirmed"
  | "minutes_without_ai"
  | "current_process"
  | "current_tools"
  | "pain_point"
>;

const CURRENT_TOOL_PRESETS = [
  "Excel",
  "Google Sheets",
  "Email",
  "WhatsApp",
  "Word",
  "PowerPoint",
];

export default function GuidedIntakeAILN({
  step,
  value,
  onChange,
  file,
  onFileChange,
  exampleMode,
  onExampleModeChange,
  allowFile = true,
  uploading = false,
  variant = "STUDENT",
  headingId = "guided-heading",
}: {
  step: number;
  value: GuidedIntake;
  onChange: (patch: Partial<GuidedIntake>) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  exampleMode: "text" | "file";
  onExampleModeChange: (mode: "text" | "file") => void;
  allowFile?: boolean;
  uploading?: boolean;
  variant?: StakeholderVariant;
  headingId?: string;
}) {
  const [otherTools, setOtherTools] = useState(() =>
    value.current_tools
      .filter((tool) => !CURRENT_TOOL_PRESETS.includes(tool))
      .join(", "),
  );

  if (step === 1)
    return (
      <div className="flex flex-col gap-5">
        <TextAreaAILN
          textAreaId="guided-task"
          aria-labelledby={headingId}
          value={value.daily_task ?? ""}
          onTextAreaChange={(daily_task) => onChange({ daily_task })}
          textAreaPlaceholder="Mis. merekap penjualan mingguan dari beberapa cabang."
          textAreaHeight="min-h-36"
          characterLength={3000}
          variant={variant}
          required
        />
        <p className="-mt-3 text-right text-[11px] text-muted-foreground">
          {(value.daily_task ?? "").trim().length} karakter · min. 30
        </p>
        <SelectAILN
          selectId="guided-frequency"
          selectName="Frekuensi"
          selectPlaceholder="Pilih frekuensi"
          value={value.frequency}
          options={GUIDED_FREQUENCIES}
          onChange={(frequency) =>
            onChange({ frequency: frequency as GuidedIntake["frequency"] })
          }
          variant={variant}
          required
        />
      </div>
    );

  if (step === 2)
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-950 dark:bg-amber-500/10 dark:text-amber-200">
          <ShieldCheck className="size-4 shrink-0" />
          <span className="flex-1">Samarkan data sensitif.</span>
          <GuidedHintAILN label="Data yang perlu disamarkan">
            Hapus NIK, rekening, gaji, dan data pelanggan asli. Ganti identitas
            dengan nama seperti “Pelanggan A”.
          </GuidedHintAILN>
        </div>
        {allowFile && (
          <div
            className="grid gap-3 sm:grid-cols-2"
            role="group"
            aria-label="Cara memberikan contoh"
          >
            <button
              type="button"
              className={`flex min-h-24 flex-col items-start justify-center gap-2 rounded-lg border p-4 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-claude ${exampleMode === "text" ? "border-claude bg-hijau-t/50 dark:bg-claude/10" : "border-dashboard-border bg-card-2 hover:border-claude/50"}`}
              aria-pressed={exampleMode === "text"}
              onClick={() => {
                onExampleModeChange("text");
                onFileChange(null);
                onChange({ sensitive_data_confirmed: false });
              }}
            >
              <TextCursorInput className="size-5 text-claude dark:text-lime-bright" />
              <span className="font-medium">Tempel contoh</span>
            </button>
            <button
              type="button"
              className={`flex min-h-24 flex-col items-start justify-center gap-2 rounded-lg border p-4 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-claude ${exampleMode === "file" ? "border-claude bg-hijau-t/50 dark:bg-claude/10" : "border-dashboard-border bg-card-2 hover:border-claude/50"}`}
              aria-pressed={exampleMode === "file"}
              onClick={() => {
                onExampleModeChange("file");
                onChange({ sensitive_data_confirmed: false });
              }}
            >
              <FileUp className="size-5 text-claude dark:text-lime-bright" />
              <span className="font-medium">Upload file</span>
            </button>
          </div>
        )}
        {!allowFile || exampleMode === "text" ? (
          <TextAreaAILN
            textAreaId="guided-example"
            aria-labelledby={headingId}
            value={value.example_text ?? ""}
            onTextAreaChange={(example_text) =>
              onChange({ example_text, sensitive_data_confirmed: false })
            }
            textAreaPlaceholder="Tempel contoh yang sudah disamarkan…"
            textAreaHeight="min-h-44"
            characterLength={10000}
            variant={variant}
            required
          />
        ) : (
          <div className="flex flex-col gap-3">
            <GuidedFileFieldAILN
              id="guided-example-file"
              file={file}
              onChange={(selected) => {
                onFileChange(selected);
                onChange({ sensitive_data_confirmed: false });
              }}
            />
            {uploading && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Mengunggah file…
              </p>
            )}
            <TextAreaAILN
              textAreaId="guided-example-summary"
              textAreaName="Ringkasan isi file"
              value={value.example_text ?? ""}
              onTextAreaChange={(example_text) =>
                onChange({ example_text, sensitive_data_confirmed: false })
              }
              textAreaPlaceholder="Tulis ringkasan isi file yang sudah disamarkan. AI membaca ringkasan ini, bukan filenya."
              textAreaHeight="min-h-28"
              characterLength={10000}
              variant={variant}
            />
          </div>
        )}
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={value.sensitive_data_confirmed}
            onChange={(e) =>
              onChange({ sensitive_data_confirmed: e.target.checked })
            }
            className="mt-0.5 size-4 shrink-0 accent-claude"
          />
          <span>Saya sudah menyamarkan data sensitif.</span>
        </label>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-sm">
        <NumberInputAILN
          inputId="guided-minutes"
          inputName="Durasi per pengerjaan (menit)"
          inputConfig="numeric"
          inputPlaceholder="Contoh: 90"
          value={
            value.minutes_without_ai === null
              ? ""
              : String(value.minutes_without_ai)
          }
          onInputChange={(raw) =>
            onChange({ minutes_without_ai: raw === "" ? null : Number(raw) })
          }
          variant={variant}
          required
        />
      </div>
      <TextAreaAILN
        textAreaId="guided-process"
        textAreaName="Proses sekarang"
        value={value.current_process ?? ""}
        onTextAreaChange={(current_process) => onChange({ current_process })}
        textAreaPlaceholder={
          "1. Kumpulkan data\n2. Cek angka di Excel\n3. Kirim ringkasan"
        }
        textAreaHeight="min-h-36"
        characterLength={5000}
        variant={variant}
        required
      />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Tool saat ini</p>
        <div className="flex flex-wrap gap-2">
          {CURRENT_TOOL_PRESETS.map((tool) => (
            <ButtonAILN
              key={tool}
              size="chip"
              variant={
                value.current_tools.includes(tool) ? "chipActive" : "chip"
              }
              aria-pressed={value.current_tools.includes(tool)}
              onClick={() =>
                onChange({
                  current_tools: value.current_tools.includes(tool)
                    ? value.current_tools.filter((item) => item !== tool)
                    : [...value.current_tools, tool],
                })
              }
            >
              {tool}
            </ButtonAILN>
          ))}
        </div>
        <InputAILN
          inputId="guided-other-tools"
          aria-label="Tool lainnya"
          inputPlaceholder="Tool lain, pisahkan dengan koma"
          inputType="text"
          value={otherTools}
          onInputChange={(raw) => {
            setOtherTools(raw);
            onChange({
              current_tools: [
                ...value.current_tools.filter((tool) =>
                  CURRENT_TOOL_PRESETS.includes(tool),
                ),
                ...raw
                  .split(",")
                  .map((tool) => tool.trim())
                  .filter(Boolean),
              ],
            });
          }}
          variant={variant}
        />
      </div>
      <TextAreaAILN
        textAreaId="guided-pain"
        textAreaName="Kendala (opsional)"
        value={value.pain_point ?? ""}
        onTextAreaChange={(pain_point) => onChange({ pain_point })}
        textAreaPlaceholder="Bagian tersulit atau paling sering salah?"
        textAreaHeight="min-h-24"
        characterLength={2000}
        variant={variant}
      />
    </div>
  );
}
