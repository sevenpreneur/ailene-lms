"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import InputAILN from "@/components/fields/InputAILN";
import NumberInputAILN from "@/components/fields/NumberInputAILN";
import SelectAILN from "@/components/fields/SelectAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { supabase } from "@/lib/supabase";
import { useProjectId } from "@/lib/use-project-id";
import type { UseCaseDetail } from "@/apis/use-cases";
import dayjs from "dayjs";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock,
  FileText,
  FileUp,
  Layers,
  Link as LinkIcon,
  Loader2,
  Send,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type AilUseCaseFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "OCCASIONALLY";
type AilUseCaseType =
  | "WORKFLOW_AUTOMATION"
  | "CONTENT_CREATION"
  | "DATA_ANALYSIS"
  | "RESEARCH"
  | "COMMUNICATION"
  | "DECISION_SUPPORT"
  | "LEARNING"
  | "OTHER";

const OUTCOME_MAX_BYTES = 20 * 1024 * 1024;
const OUTCOME_ACCEPT = ".pdf,.png,.jpg,.jpeg,.mp4";
const OUTCOME_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "video/mp4",
];

function FieldRow({
  label,
  helper,
  required,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label className="flex items-center gap-0.5 text-sm font-semibold  text-foreground dark:text-white">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {helper && (
        <p className="text-xs  text-gray-500 dark:text-gray-400">{helper}</p>
      )}
    </div>
  );
}

type Status =
  | "PENDING_SUBMIT"
  | "AWAITING_REVIEW"
  | "NEEDS_REVISION"
  | "ACCEPTED";

const statusMeta: Record<
  Status,
  { label: string; variant: GeneralLabelVariantAILN; icon: typeof CheckCircle2 }
> = {
  PENDING_SUBMIT: {
    label: "Belum dikerjakan",
    variant: "yellow",
    icon: Clock,
  },
  AWAITING_REVIEW: {
    label: "Menunggu review",
    variant: "blue",
    icon: Clock,
  },
  NEEDS_REVISION: {
    label: "Perlu revisi",
    variant: "red",
    icon: CircleAlert,
  },
  ACCEPTED: {
    label: "Diterima",
    variant: "green",
    icon: CheckCircle2,
  },
};

const FREQUENCY_OPTIONS: { value: AilUseCaseFrequency; label: string }[] = [
  { value: "DAILY", label: "Harian" },
  { value: "WEEKLY", label: "Mingguan" },
  { value: "MONTHLY", label: "Bulanan" },
  { value: "OCCASIONALLY", label: "Sesekali" },
];

const TYPE_OPTIONS: { value: AilUseCaseType; label: string }[] = [
  { value: "WORKFLOW_AUTOMATION", label: "Workflow Automation" },
  { value: "CONTENT_CREATION", label: "Content Creation" },
  { value: "DATA_ANALYSIS", label: "Data Analysis" },
  { value: "RESEARCH", label: "Research" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "DECISION_SUPPORT", label: "Decision Support" },
  { value: "LEARNING", label: "Learning" },
  { value: "OTHER", label: "Lainnya" },
];

// Popular AI tools shown as clickable chips. Stored as comma-separated VARCHAR
// in `ai_tool`. User can add custom tools beyond this list via the input below.
const AI_TOOL_PRESETS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Copilot",
  "Custom GPT",
  "Notion AI",
  "NotebookLM",
  "Cursor",
  "Windsurf",
  "Midjourney",
  "DALL·E",
  "ElevenLabs",
  "Suno",
  "Runway",
  "n8n",
  "Zapier",
  "Make",
];

export default function SubmitUseCaseAILN({
  useCase,
}: {
  useCase: UseCaseDetail;
}) {
  const projectId = useProjectId();
  const useCaseId = useCase.id;
  const router = useRouter();

  const [formData, setFormData] = useState<{
    outcomeProof: string;
    outcomeFileName: string | null;
    outcomeLinkInput: string;
    hoursSaved: string;
    hoursWithoutAi: string;
    aiTools: string[];
    aiToolCustomInput: string;
    frequency: AilUseCaseFrequency | "";
    type: AilUseCaseType | "";
    description: string;
  }>({
    outcomeProof: "",
    outcomeFileName: null,
    outcomeLinkInput: "",
    hoursSaved: "",
    hoursWithoutAi: "",
    aiTools: [],
    aiToolCustomInput: "",
    frequency: "",
    type: "",
    description: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const hoursWithoutAiNum = Number(formData.hoursWithoutAi);
    const hoursSavedNum = Number(formData.hoursSaved);
    if (
      !formData.outcomeProof.trim() ||
      !Number.isFinite(hoursWithoutAiNum) ||
      !Number.isFinite(hoursSavedNum) ||
      formData.aiTools.length === 0 ||
      !formData.frequency ||
      !formData.type ||
      !formData.description.trim()
    ) {
      toast.error("Lengkapi semua field yang wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/use-cases/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          use_case_id: useCaseId,
          outcome_proof: formData.outcomeProof.trim(),
          hours_with_ai: hoursSavedNum,
          hours_without_ai: hoursWithoutAiNum,
          description: formData.description.trim(),
          ai_tool: formData.aiTools.join(", "),
          frequency: formData.frequency.toLowerCase(),
          type: formData.type.toLowerCase(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message ?? "Gagal mengirim tugas.");
        return;
      }
      toast.success("Tugas berhasil dikirim untuk direview.");
      router.refresh();
    } catch {
      toast.error("Gagal mengirim tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    if (file.size < 1) return;
    if (file.size > OUTCOME_MAX_BYTES) {
      toast.error("Ukuran file maksimal 20MB.");
      return;
    }
    if (!OUTCOME_MIME_TYPES.includes(file.type)) {
      toast.error("Format tidak didukung. Gunakan PDF, PNG, JPG, atau MP4.");
      return;
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `ailene/use-case-outcomes/${useCaseId}-${Date.now()}-${safeName}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("sevenpreneur")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (uploadError) {
        toast.error("Gagal upload file.", { description: uploadError.message });
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("sevenpreneur")
        .getPublicUrl(filePath);
      const url = publicUrlData?.publicUrl;
      if (!url) {
        toast.error("Gagal ambil URL file.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        outcomeProof: url,
        outcomeFileName: file.name,
        outcomeLinkInput: "",
      }));
    } catch (err) {
      toast.error("Error upload", { description: `${err}` });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleUploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLocked || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUploadFile(file);
  };

  const handleLinkChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      outcomeProof: val,
      outcomeLinkInput: val,
      outcomeFileName: null,
    }));
  };

  const handleClearOutcomeFile = () => {
    setFormData((prev) => ({
      ...prev,
      outcomeProof: "",
      outcomeFileName: null,
    }));
  };

  const status: Status = useMemo(() => {
    if (useCase.is_accepted) return "ACCEPTED";
    if (!useCase.submitted_at) return "PENDING_SUBMIT";
    if (
      useCase.reviewed_at &&
      dayjs(useCase.reviewed_at).isAfter(dayjs(useCase.submitted_at))
    )
      return "NEEDS_REVISION";
    return "AWAITING_REVIEW";
  }, [useCase]);

  const meta = statusMeta[status];
  const StatusIcon = meta.icon;
  const isLocked = status === "ACCEPTED";
  const deadline = useCase.deadline_at;
  const deadlineDate = deadline ? dayjs(deadline) : null;
  const deadlineOverdue =
    deadlineDate !== null &&
    !useCase.is_accepted &&
    deadlineDate.isBefore(dayjs());

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <PageHeaderAILN title={useCase.name} />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <GeneralLabelAILN
              variant="red"
              icon={<Layers className="h-3 w-3" />}
            >
              Level {useCase.level_number}
            </GeneralLabelAILN>

            {useCase.categories.map((c) => (
              <GeneralLabelAILN
                key={c.id}
                variant="white"
                icon={<Tag className="h-3 w-3" />}
              >
                {c.name}
              </GeneralLabelAILN>
            ))}

            <GeneralLabelAILN
              variant={meta.variant}
              icon={<StatusIcon className="h-3 w-3" />}
            >
              {meta.label}
            </GeneralLabelAILN>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.8fr] lg:items-start">
          {/* LEFT: Deskripsi use case */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <div className="ailn-card flex flex-col gap-4 bg-card-1 p-5 border">
              <div className="size-10 rounded-full bg-black flex items-center justify-center text-white dark:bg-white dark:text-black">
                <FileText className="size-5" />
              </div>
              <h2 className="text-lg font-bold  text-foreground dark:text-white">
                Deskripsi Use Case
              </h2>
              <p className="text-sm whitespace-pre-wrap  text-gray-700 dark:text-gray-200">
                {useCase.description}
              </p>

              {deadlineDate && (
                <div className="flex items-center gap-2 border-t border-dashboard-border pt-3 text-xs ">
                  <CalendarClock
                    className={`size-3.5 shrink-0 ${
                      deadlineOverdue
                        ? "text-red-500"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                  <span
                    className={
                      deadlineOverdue
                        ? "font-semibold text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-300"
                    }
                  >
                    Deadline: {deadlineDate.format("ddd, D MMM YYYY · HH:mm")}
                    {deadlineOverdue ? " (lewat)" : ""}
                  </span>
                </div>
              )}
            </div>

            {status === "ACCEPTED" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Diterima oleh champion
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Form */}
          <SectionContainerAILN
            title={isLocked ? "Submission kamu" : "Laporkan use case-mu"}
            desc="Lengkapi detail penerapan, tools yang dipakai, dan bukti outcome dari use case ini."
          >
            <form className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FieldRow
                  label="Tipe Use Case"
                  helper="Kategori utama use case ini."
                  required
                >
                  <SelectAILN
                    selectId="uc-type"
                    selectPlaceholder="Pilih tipe…"
                    value={formData.type || null}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: (v as AilUseCaseType | null) ?? "",
                      }))
                    }
                    variant="STUDENT"
                    disabled={isLocked}
                    required
                    options={TYPE_OPTIONS.map((o) => ({
                      label: o.label,
                      value: o.value,
                    }))}
                  />
                </FieldRow>
                <FieldRow
                  label="Frekuensi Pemakaian"
                  helper="Seberapa sering use case ini kamu pakai."
                  required
                >
                  <SelectAILN
                    selectId="uc-frequency"
                    selectPlaceholder="Pilih frekuensi…"
                    value={formData.frequency || null}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        frequency: (v as AilUseCaseFrequency | null) ?? "",
                      }))
                    }
                    variant="STUDENT"
                    disabled={isLocked}
                    required
                    options={FREQUENCY_OPTIONS.map((o) => ({
                      label: o.label,
                      value: o.value,
                    }))}
                  />
                </FieldRow>
              </div>

              <FieldRow label="Ceritakan apa yang kamu kerjakan" required>
                <div className="flex flex-col gap-1">
                  <TextAreaAILN
                    textAreaId="uc-description"
                    textAreaPlaceholder="3–5 kalimat cukup. Apa problem-nya, AI apa yang kamu pakai, dan apa hasilnya."
                    value={formData.description}
                    onTextAreaChange={(v) =>
                      setFormData((prev) => ({ ...prev, description: v }))
                    }
                    characterLength={5000}
                    textAreaHeight="min-h-[160px]"
                    variant="STUDENT"
                    disabled={isLocked}
                    required
                  />
                  <div className="self-end text-xs  text-gray-400">
                    {formData.description.length}/5000 karakter
                  </div>
                </div>
              </FieldRow>

              <FieldRow
                label="Jam Kerja: Tanpa vs Dengan AI"
                helper="Estimasi waktu untuk menyelesaikan task ini sebelum vs sesudah pakai AI."
                required
              >
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium  text-gray-600 dark:text-gray-300">
                      Tanpa AI
                    </span>
                    <div className="w-24">
                      <NumberInputAILN
                        inputId="uc-hours-without"
                        inputConfig="decimal"
                        inputPlaceholder="18"
                        value={formData.hoursWithoutAi}
                        onInputChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            hoursWithoutAi: v,
                          }))
                        }
                        variant="STUDENT"
                        disabled={isLocked}
                        required
                      />
                    </div>
                    <span className="text-xs  text-gray-500">jam</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium  text-gray-600 dark:text-gray-300">
                      Dengan AI
                    </span>
                    <div className="w-24">
                      <NumberInputAILN
                        inputId="uc-hours"
                        inputConfig="decimal"
                        inputPlaceholder="5"
                        value={formData.hoursSaved}
                        onInputChange={(v) =>
                          setFormData((prev) => ({ ...prev, hoursSaved: v }))
                        }
                        variant="STUDENT"
                        disabled={isLocked}
                        required
                      />
                    </div>
                    <span className="text-xs  text-gray-500">jam</span>
                  </div>
                  {(() => {
                    const without = Number(formData.hoursWithoutAi);
                    const withAi = Number(formData.hoursSaved);
                    if (
                      !Number.isFinite(without) ||
                      !Number.isFinite(withAi) ||
                      without <= 0 ||
                      withAi < 0 ||
                      withAi >= without
                    ) {
                      return null;
                    }
                    const saved = without - withAi;
                    const pct = Math.round((saved / without) * 100);
                    return (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        Jam dihemat: {saved.toFixed(saved % 1 === 0 ? 0 : 1)}{" "}
                        jam · {pct}% lebih cepat
                      </span>
                    );
                  })()}
                </div>
              </FieldRow>

              <FieldRow
                label="AI Tools yang Dipakai"
                helper="Klik untuk pilih. Bisa tambah tool custom di bawah."
                required
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {AI_TOOL_PRESETS.map((tool) => {
                      const selected = formData.aiTools.includes(tool);
                      return (
                        <button
                          key={tool}
                          type="button"
                          disabled={isLocked}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              aiTools: selected
                                ? prev.aiTools.filter((t) => t !== tool)
                                : [...prev.aiTools, tool],
                            }))
                          }
                          className={`rounded-full border px-3 py-1 text-xs font-medium  transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            selected
                              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                              : "border-dashboard-border bg-white text-foreground hover:border-foreground/40 dark:bg-card-2 dark:text-gray-200"
                          }`}
                        >
                          {tool}
                        </button>
                      );
                    })}
                    {formData.aiTools
                      .filter((t) => !AI_TOOL_PRESETS.includes(t))
                      .map((tool) => (
                        <button
                          key={tool}
                          type="button"
                          disabled={isLocked}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              aiTools: prev.aiTools.filter((t) => t !== tool),
                            }))
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-black bg-black px-3 py-1 text-xs font-medium  text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black"
                        >
                          {tool}
                          <X className="size-3" />
                        </button>
                      ))}
                  </div>
                  {!isLocked && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[280px]">
                        <InputAILN
                          inputId="uc-tool-other"
                          inputType="text"
                          inputPlaceholder="Tambah tool lain (e.g. Loveable, Bolt)…"
                          value={formData.aiToolCustomInput}
                          onInputChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              aiToolCustomInput: v,
                            }))
                          }
                          characterLength={64}
                          variant="STUDENT"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!formData.aiToolCustomInput.trim()}
                        onClick={() => {
                          const v = formData.aiToolCustomInput.trim();
                          if (!v) return;
                          setFormData((prev) =>
                            prev.aiTools.includes(v)
                              ? { ...prev, aiToolCustomInput: "" }
                              : {
                                  ...prev,
                                  aiTools: [...prev.aiTools, v],
                                  aiToolCustomInput: "",
                                }
                          );
                        }}
                        className="rounded-md border border-dashboard-border bg-white px-3 py-2 text-xs font-semibold  text-foreground hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-card-2 dark:text-gray-200"
                      >
                        Tambah
                      </button>
                    </div>
                  )}
                </div>
              </FieldRow>

              {/* Bukti Outcome — upload file OR paste link, both write to outcome_proof */}
              <FieldRow
                label="Bukti Outcome"
                helper="Upload bukti hasil kerja atau link yang menunjukkan dampak nyata."
                required
              >
                <div className="flex flex-col gap-3">
                  {/* Upload zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!isLocked && !isUploading) setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!isLocked && !isUploading)
                        fileInputRef.current?.click();
                    }}
                    className={`relative flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-4 py-6 text-center transition ${
                      isLocked || isUploading
                        ? "cursor-not-allowed opacity-60 border-dashboard-border bg-card-2"
                        : isDragOver
                          ? "border-black bg-black/5 cursor-pointer dark:border-white dark:bg-white/5"
                          : "border-dashboard-border bg-card-2 cursor-pointer hover:border-foreground/40"
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="size-5 animate-spin text-gray-500" />
                    ) : (
                      <FileUp className="size-5 text-gray-500 dark:text-gray-400" />
                    )}
                    <p className="text-sm font-medium  text-foreground dark:text-gray-200">
                      {isUploading
                        ? "Mengupload…"
                        : "Upload file atau drag & drop di sini"}
                    </p>
                    <p className="text-[11px]  text-gray-500 dark:text-gray-400">
                      PDF, PNG, JPG, MP4 · Maks. 20MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={OUTCOME_ACCEPT}
                      className="hidden"
                      onChange={handleFilePick}
                      disabled={isLocked || isUploading}
                    />
                  </div>

                  {/* "atau" separator */}
                  <div className="flex items-center gap-2 text-xs font-medium  text-gray-400">
                    <span className="h-px flex-1 bg-dashboard-border" />
                    <span>atau</span>
                    <span className="h-px flex-1 bg-dashboard-border" />
                  </div>

                  {/* Link input */}
                  <InputAILN
                    inputId="uc-outcome-link"
                    inputType="url"
                    inputIcon={<LinkIcon className="size-4" />}
                    inputPlaceholder="Tempel link (Google Drive, Notion, dll)"
                    value={formData.outcomeLinkInput}
                    onInputChange={handleLinkChange}
                    characterLength={500}
                    variant="STUDENT"
                    disabled={isLocked || isUploading}
                  />
                </div>

                {/* Uploaded file chip */}
                {formData.outcomeFileName && (
                  <div className="flex items-center justify-between gap-2 rounded-md border border-dashboard-border bg-card-2 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileUp className="size-4 shrink-0 text-foreground dark:text-gray-300" />
                      <span className="truncate text-xs font-medium  text-foreground dark:text-gray-200">
                        {formData.outcomeFileName}
                      </span>
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={handleClearOutcomeFile}
                        className="rounded p-1 text-gray-500 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </FieldRow>

              {!isLocked && (
                <ButtonAILN
                  type="button"
                  variant="primary"
                  className="w-fit self-end"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {status === "NEEDS_REVISION"
                    ? "Kirim Revisi"
                    : useCase.submitted_at
                      ? "Update Submission"
                      : "Kirim Tugas"}
                </ButtonAILN>
              )}
              {isLocked && (
                <Link
                  href={`/${projectId}/student/skill-practice`}
                  className="self-center text-sm text-gray-500 underline dark:text-gray-400"
                >
                  Kembali ke daftar tugas
                </Link>
              )}
            </form>
          </SectionContainerAILN>
        </div>
      </div>
    </PageContainerAILN>
  );
}
