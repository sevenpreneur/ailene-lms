"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import NumberInputAILN from "@/components/fields/NumberInputAILN";
import SelectAILN from "@/components/fields/SelectAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { supabase } from "@/lib/supabase";
import { setSessionToken, trpc } from "@/trpc/client";
import { AilUseCaseFrequency, AilUseCaseType } from "@prisma/client";
import {
  FileText,
  FileUp,
  Link as LinkIcon,
  Loader2,
  Send,
  Sparkles,
  SquarePen,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Select from "react-select";
import { toast } from "sonner";

type PracticeType = "PROMPT" | "USE_CASE";
type CategoryOption = { value: number; label: string };

const OUTCOME_MAX_BYTES = 20 * 1024 * 1024;
const OUTCOME_ACCEPT = ".pdf,.png,.jpg,.jpeg,.mp4";
const OUTCOME_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "video/mp4",
];

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

function FieldRow({
  icon,
  label,
  helper,
  required,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {icon && (
        <div className="size-9 shrink-0 rounded-md border border-dashboard-border bg-card-2 flex items-center justify-center text-foreground dark:text-gray-300">
          {icon}
        </div>
      )}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <label className="flex items-center gap-0.5 text-sm font-semibold  text-foreground dark:text-white">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
        {children}
        {helper && (
          <p className="text-xs  text-gray-500 dark:text-gray-400">{helper}</p>
        )}
      </div>
    </div>
  );
}

export default function CreateSelfPracticeAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const router = useRouter();
  const utils = trpc.useUtils();
  const categoriesQ = trpc.list.memberCategories.useQuery();
  const categories = useMemo(
    () => categoriesQ.data?.list ?? [],
    [categoriesQ.data]
  );
  const categoryOptions = useMemo<CategoryOption[]>(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const [type, setType] = useState<PracticeType>("PROMPT");

  // Shared
  const [name, setName] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const selectedCategoryOptions = useMemo(
    () => categoryOptions.filter((o) => selectedCategoryIds.includes(o.value)),
    [categoryOptions, selectedCategoryIds]
  );

  // Prompt
  const [scenario, setScenario] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [promptOutput, setPromptOutput] = useState("");

  // Use case
  const [description, setDescription] = useState("");
  const [hoursWithoutAi, setHoursWithoutAi] = useState("");
  const [hoursSaved, setHoursSaved] = useState("");
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [aiToolCustomInput, setAiToolCustomInput] = useState("");
  const [frequency, setFrequency] = useState<AilUseCaseFrequency | "">("");
  const [useCaseType, setUseCaseType] = useState<AilUseCaseType | "">("");
  const [outcomeProof, setOutcomeProof] = useState("");
  const [outcomeFileName, setOutcomeFileName] = useState<string | null>(null);
  const [outcomeLinkInput, setOutcomeLinkInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const promptM = trpc.create.selfPrompt.useMutation();
  const useCaseM = trpc.create.selfUseCase.useMutation();
  const isPending = promptM.isPending || useCaseM.isPending;

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
    const filePath = `ailene/use-case-outcomes/self-${Date.now()}-${safeName}`;

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
      setOutcomeProof(url);
      setOutcomeFileName(file.name);
      setOutcomeLinkInput("");
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
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUploadFile(file);
  };

  const handleLinkChange = (val: string) => {
    setOutcomeProof(val);
    setOutcomeLinkInput(val);
    setOutcomeFileName(null);
  };

  const goToList = () => {
    toast.success("Latihan berhasil dikirim ke champion untuk direview.");
    utils.list.assignedPrompts.invalidate();
    utils.list.assignedUseCases.invalidate();
    utils.list.memberPromptLibrary.invalidate();
    utils.list.memberUseCaseLibrary.invalidate();
    utils.list.practiceSubmissions.invalidate();
    utils.read.todayFocus.invalidate();
    router.push("/student/skill-practice");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Judul latihan wajib diisi.");
      return;
    }
    if (selectedCategoryIds.length === 0) {
      toast.error("Pilih minimal satu kategori.");
      return;
    }

    if (type === "PROMPT") {
      if (!scenario.trim()) {
        toast.error("Konteks / tujuan wajib diisi.");
        return;
      }
      if (!promptInput.trim()) {
        toast.error("Prompt yang kamu pakai wajib diisi.");
        return;
      }
      if (!promptOutput.trim()) {
        toast.error("Output dari AI wajib diisi.");
        return;
      }
      promptM.mutate(
        {
          name: name.trim(),
          scenario: scenario.trim(),
          input: promptInput.trim(),
          output: promptOutput.trim(),
          category_ids: selectedCategoryIds,
        },
        {
          onSuccess: goToList,
          onError: (err) =>
            toast.error("Gagal kirim", { description: err.message }),
        }
      );
      return;
    }

    // USE_CASE
    if (!useCaseType) {
      toast.error("Pilih tipe use case.");
      return;
    }
    if (!frequency) {
      toast.error("Pilih frekuensi pemakaian.");
      return;
    }
    if (!description.trim()) {
      toast.error("Cerita penerapan wajib diisi.");
      return;
    }
    const withoutNum = Number(hoursWithoutAi);
    if (!Number.isFinite(withoutNum) || withoutNum < 0) {
      toast.error("Jam tanpa AI harus angka non-negatif.");
      return;
    }
    const withNum = Number(hoursSaved);
    if (!Number.isFinite(withNum) || withNum < 0) {
      toast.error("Jam dengan AI harus angka non-negatif.");
      return;
    }
    if (aiTools.length === 0) {
      toast.error("Pilih minimal satu AI tool.");
      return;
    }
    const aiToolCsv = aiTools.join(", ");
    if (aiToolCsv.length > 255) {
      toast.error("Daftar AI tool terlalu panjang (maks 255 karakter).");
      return;
    }
    if (!outcomeProof.trim()) {
      toast.error("Bukti outcome wajib diisi.");
      return;
    }

    useCaseM.mutate(
      {
        name: name.trim(),
        category_ids: selectedCategoryIds,
        outcome_proof: outcomeProof.trim(),
        hours_with_ai: withNum,
        hours_without_ai: withoutNum,
        description: description.trim(),
        ai_tool: aiToolCsv,
        frequency: frequency as AilUseCaseFrequency,
        type: useCaseType as AilUseCaseType,
      },
      {
        onSuccess: goToList,
        onError: (err) =>
          toast.error("Gagal kirim", { description: err.message }),
      }
    );
  };

  return (
    <PageContainerAILN>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        {/* Header */}
        <PageHeaderAILN
          title="Catat Latihan Mandiri"
          desc="Catat prompt atau use case yang kamu kerjakan sendiri. Setelah dikirim, latihan ini masuk antrian review champion-mu."
        />

        {/* Type toggle */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold  text-foreground dark:text-white">
            Tipe latihan
          </span>
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            {(
              [
                {
                  value: "PROMPT" as const,
                  label: "Prompt",
                  desc: "Prompt + output AI",
                  icon: SquarePen,
                },
                {
                  value: "USE_CASE" as const,
                  label: "Use Case",
                  desc: "Penerapan AI nyata",
                  icon: Sparkles,
                },
              ] satisfies {
                value: PracticeType;
                label: string;
                desc: string;
                icon: typeof SquarePen;
              }[]
            ).map((opt) => {
              const active = type === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                    active
                      ? "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-500/10"
                      : "border-dashboard-border bg-white hover:border-foreground/30 dark:bg-card-1"
                  }`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                      active
                        ? "bg-red-500 text-white"
                        : "bg-card-2 text-foreground dark:text-gray-300"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold  text-foreground dark:text-white">
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {opt.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <SectionContainerAILN
          title="Informasi Dasar"
          desc="Berlaku untuk semua tipe latihan."
          contentClassName="flex flex-col gap-4"
        >
          {/* Judul */}
          <FieldRow
            icon={<FileText className="size-4" />}
            label="Judul latihan"
            helper="Nama singkat yang menggambarkan latihan ini."
            required
          >
            <InputAILN
              inputId="practice-name"
              inputType="text"
              inputPlaceholder={
                type === "PROMPT"
                  ? "Mis. Bikin email follow-up klien"
                  : "Mis. Otomasi rekap meeting mingguan"
              }
              value={name}
              onInputChange={setName}
              characterLength={255}
              variant="STUDENT"
            />
          </FieldRow>

          {/* Kategori */}
          <FieldRow
            icon={<Tag className="size-4" />}
            label="Kategori"
            helper={`Cari & pilih kategori (maks 2). ${selectedCategoryIds.length}/2 dipilih.`}
            required
          >
            <Select<CategoryOption, true>
              isMulti
              instanceId="self-practice-category"
              options={categoryOptions}
              value={selectedCategoryOptions}
              onChange={(vals) =>
                setSelectedCategoryIds(vals.map((v) => v.value))
              }
              isOptionDisabled={() => selectedCategoryIds.length >= 2}
              isLoading={categoriesQ.isLoading}
              closeMenuOnSelect={false}
              placeholder="Cari & pilih kategori (maks 2)…"
              loadingMessage={() => "Memuat kategori…"}
              noOptionsMessage={() =>
                categories.length === 0
                  ? "Belum ada kategori."
                  : "Kategori tidak ditemukan."
              }
              unstyled
              classNames={{
                control: ({ isFocused }) =>
                  `rounded-md border bg-card-2 px-2 py-1 text-sm transition ${
                    isFocused ? "border-red-500" : "border-dashboard-border"
                  }`,
                valueContainer: () => "flex flex-wrap gap-1 py-0.5",
                placeholder: () => "px-1 text-gray-400 dark:text-gray-500",
                input: () => "px-1 text-sm dark:text-gray-200",
                multiValue: () =>
                  "inline-flex items-center overflow-hidden rounded-md bg-red-50 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300",
                multiValueLabel: () => "py-0.5 pl-2",
                multiValueRemove: () =>
                  "flex items-center px-1 hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-500/20",
                indicatorsContainer: () => "flex items-center text-gray-400",
                indicatorSeparator: () => "hidden",
                dropdownIndicator: () => "px-1 hover:text-gray-600",
                clearIndicator: () => "px-1 hover:text-gray-600",
                menu: () =>
                  "z-50 mt-1 overflow-hidden rounded-md border border-dashboard-border bg-card-1 shadow-lg",
                menuList: () => "max-h-60 overflow-y-auto p-1",
                option: ({ isFocused, isDisabled }) =>
                  `rounded px-2 py-1.5 text-sm ${
                    isDisabled
                      ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                      : isFocused
                        ? "cursor-pointer bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                        : "cursor-pointer text-gray-700 dark:text-gray-200"
                  }`,
                noOptionsMessage: () => "p-2 text-sm text-gray-500",
                loadingMessage: () => "p-2 text-sm text-gray-500",
              }}
            />
          </FieldRow>
        </SectionContainerAILN>

        {/* ── PROMPT fields ── */}
        {type === "PROMPT" && (
          <SectionContainerAILN
            title="Detail Prompt"
            desc="Catat prompt yang kamu pakai beserta output dari AI."
            contentClassName="flex flex-col gap-4"
          >
            <FieldRow
              icon={<FileText className="size-4" />}
              label="Konteks / tujuan"
              helper="Apa yang ingin kamu capai dengan prompt ini?"
              required
            >
              <TextAreaAILN
                textAreaId="practice-scenario"
                textAreaPlaceholder="Ceritakan situasi atau tujuan kamu memakai prompt ini…"
                value={scenario}
                onTextAreaChange={setScenario}
                characterLength={2000}
                textAreaHeight="min-h-[100px]"
                variant="STUDENT"
              />
            </FieldRow>

            <FieldRow
              icon={<SquarePen className="size-4" />}
              label="Prompt yang kamu pakai"
              helper="Tulis prompt persis seperti yang kamu kirim ke AI."
              required
            >
              <div className="flex flex-col gap-1">
                <TextAreaAILN
                  textAreaId="practice-input"
                  textAreaPlaceholder="Tulis prompt yang kamu kirim ke AI…"
                  value={promptInput}
                  onTextAreaChange={setPromptInput}
                  characterLength={5000}
                  textAreaHeight="min-h-[150px]"
                  variant="STUDENT"
                />
                <div className="self-end text-xs  text-gray-400">
                  {promptInput.length}/5000 karakter
                </div>
              </div>
            </FieldRow>

            <FieldRow
              icon={<Sparkles className="size-4" />}
              label="Output dari AI"
              helper="Tempel hasil dari AI apa adanya, tanpa diedit."
              required
            >
              <div className="flex flex-col gap-1">
                <TextAreaAILN
                  textAreaId="practice-output"
                  textAreaPlaceholder="Tempel hasil dari AI…"
                  value={promptOutput}
                  onTextAreaChange={setPromptOutput}
                  characterLength={10000}
                  textAreaHeight="min-h-[180px]"
                  variant="STUDENT"
                />
                <div className="self-end text-xs  text-gray-400">
                  {promptOutput.length}/10000 karakter
                </div>
              </div>
            </FieldRow>
          </SectionContainerAILN>
        )}

        {/* ── USE CASE fields ── */}
        {type === "USE_CASE" && (
          <SectionContainerAILN
            title="Detail Use Case"
            desc="Ceritakan penerapan AI nyata yang kamu kerjakan."
            contentClassName="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldRow label="Tipe Use Case" required>
                <SelectAILN
                  selectId="uc-type"
                  selectPlaceholder="Pilih tipe…"
                  value={useCaseType || null}
                  onChange={(v) =>
                    setUseCaseType((v as AilUseCaseType | null) ?? "")
                  }
                  variant="STUDENT"
                  required
                  options={TYPE_OPTIONS.map((o) => ({
                    label: o.label,
                    value: o.value,
                  }))}
                />
              </FieldRow>
              <FieldRow label="Frekuensi Pemakaian" required>
                <SelectAILN
                  selectId="uc-frequency"
                  selectPlaceholder="Pilih frekuensi…"
                  value={frequency || null}
                  onChange={(v) =>
                    setFrequency((v as AilUseCaseFrequency | null) ?? "")
                  }
                  variant="STUDENT"
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
                  value={description}
                  onTextAreaChange={setDescription}
                  characterLength={5000}
                  textAreaHeight="min-h-[150px]"
                  variant="STUDENT"
                />
                <div className="self-end text-xs  text-gray-400">
                  {description.length}/5000 karakter
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
                      value={hoursWithoutAi}
                      onInputChange={setHoursWithoutAi}
                      variant="STUDENT"
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
                      value={hoursSaved}
                      onInputChange={setHoursSaved}
                      variant="STUDENT"
                    />
                  </div>
                  <span className="text-xs  text-gray-500">jam</span>
                </div>
                {(() => {
                  const without = Number(hoursWithoutAi);
                  const withAi = Number(hoursSaved);
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
                      Jam dihemat: {saved.toFixed(saved % 1 === 0 ? 0 : 1)} jam
                      · {pct}% lebih cepat
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
                    const selected = aiTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() =>
                          setAiTools((prev) =>
                            selected
                              ? prev.filter((t) => t !== tool)
                              : [...prev, tool]
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-medium  transition ${
                          selected
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-dashboard-border bg-white text-foreground hover:border-foreground/40 dark:bg-card-2 dark:text-gray-200"
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                  {aiTools
                    .filter((t) => !AI_TOOL_PRESETS.includes(t))
                    .map((tool) => (
                      <button
                        key={tool}
                        type="button"
                        onClick={() =>
                          setAiTools((prev) => prev.filter((t) => t !== tool))
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-black bg-black px-3 py-1 text-xs font-medium  text-white dark:border-white dark:bg-white dark:text-black"
                      >
                        {tool}
                        <X className="size-3" />
                      </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-[280px]">
                    <InputAILN
                      inputId="uc-tool-other"
                      inputType="text"
                      inputPlaceholder="Tambah tool lain (e.g. Loveable, Bolt)…"
                      value={aiToolCustomInput}
                      onInputChange={setAiToolCustomInput}
                      characterLength={64}
                      variant="STUDENT"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!aiToolCustomInput.trim()}
                    onClick={() => {
                      const v = aiToolCustomInput.trim();
                      if (!v) return;
                      setAiTools((prev) =>
                        prev.includes(v) ? prev : [...prev, v]
                      );
                      setAiToolCustomInput("");
                    }}
                    className="rounded-md border border-dashboard-border bg-white px-3 py-2 text-xs font-semibold  text-foreground hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-card-2 dark:text-gray-200"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </FieldRow>

            {/* Bukti Outcome — upload file OR paste link, both write to outcome_proof */}
            <FieldRow
              label="Bukti Outcome"
              helper="Upload bukti hasil kerja atau link yang menunjukkan dampak nyata."
              required
            >
              <div className="flex flex-col gap-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isUploading) setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isUploading) fileInputRef.current?.click();
                  }}
                  className={`relative flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-4 py-6 text-center transition ${
                    isUploading
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
                    disabled={isUploading}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-medium  text-gray-400">
                  <span className="h-px flex-1 bg-dashboard-border" />
                  <span>atau</span>
                  <span className="h-px flex-1 bg-dashboard-border" />
                </div>

                <InputAILN
                  inputId="uc-outcome-link"
                  inputType="url"
                  inputIcon={<LinkIcon className="size-4" />}
                  inputPlaceholder="Tempel link (Google Drive, Notion, dll)"
                  value={outcomeLinkInput}
                  onInputChange={handleLinkChange}
                  characterLength={500}
                  variant="STUDENT"
                  disabled={isUploading}
                />
              </div>

              {outcomeFileName && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-dashboard-border bg-card-2 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileUp className="size-4 shrink-0 text-foreground dark:text-gray-300" />
                    <span className="truncate text-xs font-medium  text-foreground dark:text-gray-200">
                      {outcomeFileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOutcomeProof("");
                      setOutcomeFileName(null);
                    }}
                    className="rounded p-1 text-gray-500 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </FieldRow>
          </SectionContainerAILN>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-dashboard-border pt-4">
          <Link href="/student/skill-practice">
            <ButtonAILN type="button" variant="neutral" className="w-fit">
              Batal
            </ButtonAILN>
          </Link>
          <ButtonAILN
            type="submit"
            variant="primary"
            disabled={isPending || isUploading}
            className="w-fit"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Mengirim…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Kirim Latihan
              </>
            )}
          </ButtonAILN>
        </div>
      </form>
    </PageContainerAILN>
  );
}
