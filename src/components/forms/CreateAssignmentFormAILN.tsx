"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import SheetAILN from "@/components/modals/SheetAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { AssignmentDraft, TeamMember } from "@/apis/champion";
import type { Category } from "@/apis/categories";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Select from "react-select";

type AssignmentKind = "PROMPT" | "USE_CASE";
type TargetMode = "INDIVIDUAL" | "BULK";
type CategoryOption = { value: number; label: string };

type FormState = {
  kind: AssignmentKind;
  name: string;
  description: string;
  expectedOutput: string;
  selectedCategoryIds: number[];
  assignEnabled: boolean;
  mode: TargetMode;
  selectedMemberIds: string[];
  selectedGroupIds: number[];
  deadlineDate: string;
  deadlineTime: string;
  message: string;
};

// An AI draft defaults to assigning the champion's whole group.
function buildInitialForm(
  draft: AssignmentDraft | null,
  group: { id: number; name: string } | null
): FormState {
  const assignToGroup = draft !== null && group !== null;
  return {
    kind: draft?.kind ?? "PROMPT",
    name: draft?.name ?? "",
    description: draft?.description ?? "",
    expectedOutput: draft?.expected_output ?? "",
    selectedCategoryIds: draft?.category_ids.slice(0, 2) ?? [],
    assignEnabled: assignToGroup,
    mode: assignToGroup ? "BULK" : "INDIVIDUAL",
    selectedMemberIds: [],
    selectedGroupIds: assignToGroup ? [group.id] : [],
    deadlineDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
    deadlineTime: "23:59",
    message: "",
  };
}

interface CreateAssignmentFormAILNProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  group: { id: number; name: string } | null;
  categories: Category[];
  draft?: AssignmentDraft | null;
}

export default function CreateAssignmentFormAILN({
  isOpen,
  onClose,
  members,
  group,
  categories,
  draft = null,
}: CreateAssignmentFormAILNProps) {
  const projectId = useProjectId();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormState>(() =>
    buildInitialForm(draft, group)
  );

  // Curried single-field updater: handleInputChange("name")(value)
  const handleInputChange = (fieldName: string) => (value: unknown) =>
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

  // A champion leads exactly one group, so bulk mode targets only that group.
  const groups = useMemo(() => (group ? [group] : []), [group]);

  const categoryOptions = useMemo<CategoryOption[]>(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );
  const selectedCategoryOptions = useMemo(
    () =>
      categoryOptions.filter((o) =>
        formData.selectedCategoryIds.includes(o.value)
      ),
    [categoryOptions, formData.selectedCategoryIds]
  );
  const toggleMember = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      selectedMemberIds: prev.selectedMemberIds.includes(id)
        ? prev.selectedMemberIds.filter((x) => x !== id)
        : [...prev.selectedMemberIds, id],
    }));
  const toggleGroup = (id: number) =>
    setFormData((prev) => ({
      ...prev,
      selectedGroupIds: prev.selectedGroupIds.includes(id)
        ? prev.selectedGroupIds.filter((x) => x !== id)
        : [...prev.selectedGroupIds, id],
    }));

  const handleCreate = async () => {
    if (isSubmitting) return;

    const isPrompt = formData.kind === "PROMPT";
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Nama dan deskripsi wajib diisi.");
      return;
    }
    if (isPrompt && !formData.expectedOutput.trim()) {
      toast.error("Expected output wajib diisi.");
      return;
    }
    if (
      formData.selectedCategoryIds.length < 1 ||
      formData.selectedCategoryIds.length > 2
    ) {
      toast.error("Pilih 1 sampai 2 kategori.");
      return;
    }

    let assignment = null;
    if (formData.assignEnabled) {
      const deadline = dayjs(
        `${formData.deadlineDate}T${formData.deadlineTime}`
      );
      if (!deadline.isValid() || deadline.isBefore(dayjs())) {
        toast.error("Deadline harus di masa depan.");
        return;
      }
      const isMember = formData.mode === "INDIVIDUAL";
      if (isMember && formData.selectedMemberIds.length === 0) {
        toast.error("Pilih minimal satu anggota.");
        return;
      }
      if (!isMember && formData.selectedGroupIds.length === 0) {
        toast.error("Pilih minimal satu grup.");
        return;
      }
      assignment = {
        target_type: isMember ? "MEMBER" : "GROUP",
        ...(isMember
          ? { target_access_ids: formData.selectedMemberIds }
          : { target_group_ids: formData.selectedGroupIds }),
        deadline: deadline.toISOString(),
        message: formData.message.trim() || null,
      };
    }

    setIsSubmitting(true);
    try {
      const endpoint = isPrompt
        ? "/api/champion/prompts/create-assignment"
        : "/api/champion/use-cases/create-assignment";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          ...(isPrompt
            ? { expected_output: formData.expectedOutput.trim() }
            : {}),
          category_ids: formData.selectedCategoryIds,
          assignment,
          // Backend rejects a draft whose kind no longer matches, so drop the link if it was switched.
          draft_id: draft?.kind === formData.kind ? draft.id : null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.message ?? "Gagal menyimpan. Coba lagi.");
        return;
      }

      toast.success(
        assignment
          ? `Dibuat dan di-assign ke ${payload?.assigned_count ?? 0} anggota.`
          : "Ditambahkan ke library."
      );
      resetForm();
      onClose();
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => setFormData(buildInitialForm(null, group));

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <SheetAILN
      isOpen={isOpen}
      onClose={handleClose}
      sheetName={draft ? "Review Draft dari AI" : "Buat Assignment Baru"}
      sheetDescription={
        draft
          ? "Cek dan edit draft dari AI. Item baru tersimpan ke library setelah Anda klik tombol di bawah."
          : "Tambah prompt atau use case ke library, lalu (opsional) assign ke anggota."
      }
    >
      <form className="relative flex h-full w-full flex-col">
        <div className="flex h-full flex-col gap-5 overflow-y-auto px-6 pb-28">
          {/* Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Tipe
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInputChange("kind")("PROMPT")}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  formData.kind === "PROMPT"
                    ? "border-claude bg-hijau-t text-claude dark:bg-claude/10 dark:text-lime-bright"
                    : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
                }`}
              >
                Prompt (L2)
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("kind")("USE_CASE")}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  formData.kind === "USE_CASE"
                    ? "border-claude bg-hijau-t text-claude dark:bg-claude/10 dark:text-lime-bright"
                    : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
                }`}
              >
                Use Case (L3)
              </button>
            </div>
          </div>

          {/* Name */}
          <InputAILN
            inputId="assignment-name"
            inputName="Nama"
            inputType="text"
            variant="CHAMPION"
            value={formData.name}
            onInputChange={handleInputChange("name")}
            characterLength={255}
            inputPlaceholder={
              formData.kind === "PROMPT"
                ? "Contoh: Brainstorm caption Instagram"
                : "Contoh: Otomasi laporan penjualan mingguan"
            }
            required
          />

          {/* Description */}
          <TextAreaAILN
            textAreaId="assignment-description"
            textAreaName={formData.kind === "PROMPT" ? "Skenario" : "Deskripsi"}
            variant="CHAMPION"
            value={formData.description}
            onTextAreaChange={handleInputChange("description")}
            textAreaHeight="h-28"
            characterLength={4000}
            textAreaPlaceholder={
              formData.kind === "PROMPT"
                ? "Jelaskan skenario / konteks prompt-nya…"
                : "Jelaskan use case-nya secara singkat…"
            }
            required
          />

          {/* Expected Output (prompt only) */}
          {formData.kind === "PROMPT" && (
            <TextAreaAILN
              textAreaId="assignment-expected-output"
              textAreaName="Expected Output"
              variant="CHAMPION"
              value={formData.expectedOutput}
              onTextAreaChange={handleInputChange("expectedOutput")}
              textAreaHeight="h-28"
              characterLength={4000}
              textAreaPlaceholder="Deskripsikan output yang diharapkan dari prompt ini…"
              required
            />
          )}

          {/* Categories — searchable multi-select (no AILN equivalent) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Kategori <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {formData.selectedCategoryIds.length}/2 dipilih
              </span>
            </div>

            <Select<CategoryOption, true>
              isMulti
              instanceId="champion-assignment-category"
              options={categoryOptions}
              value={selectedCategoryOptions}
              onChange={(vals) =>
                handleInputChange("selectedCategoryIds")(
                  vals.map((v) => v.value)
                )
              }
              isOptionDisabled={() => formData.selectedCategoryIds.length >= 2}
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
                    isFocused ? "border-claude" : "border-dashboard-border"
                  }`,
                valueContainer: () => "flex flex-wrap gap-1 py-0.5",
                placeholder: () => "px-1 text-gray-400 dark:text-gray-500",
                input: () => "px-1 text-sm dark:text-gray-200",
                multiValue: () =>
                  "inline-flex items-center overflow-hidden rounded-md bg-hijau-t text-xs font-medium text-claude dark:bg-claude/10 dark:text-lime-bright",
                multiValueLabel: () => "py-0.5 pl-2",
                multiValueRemove: () =>
                  "flex items-center px-1 hover:bg-hijau/40 hover:text-claude dark:hover:bg-claude/20",
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
                        ? "cursor-pointer bg-hijau-t text-claude dark:bg-claude/10 dark:text-lime-bright"
                        : "cursor-pointer text-gray-700 dark:text-gray-200"
                  }`,
                noOptionsMessage: () => "p-2 text-sm text-gray-500",
                loadingMessage: () => "p-2 text-sm text-gray-500",
              }}
            />
          </div>

          {/* Assign toggle */}
          <div className="flex flex-col gap-2 rounded-md border border-dashboard-border p-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.assignEnabled}
                onChange={(e) =>
                  handleInputChange("assignEnabled")(e.target.checked)
                }
                className="mt-1 size-4"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium dark:text-white">
                  Langsung assign ke anggota
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Kalau dicentang, item ini langsung dikirim ke anggota yang
                  dipilih beserta deadline-nya.
                </span>
              </div>
            </label>
          </div>

          {formData.assignEnabled && (
            <>
              {/* Target mode */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Target
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange("mode")("INDIVIDUAL")}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                      formData.mode === "INDIVIDUAL"
                        ? "border-claude bg-hijau-t text-claude dark:bg-claude/10 dark:text-lime-bright"
                        : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
                    }`}
                  >
                    Assign Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("mode")("BULK")}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                      formData.mode === "BULK"
                        ? "border-claude bg-hijau-t text-claude dark:bg-claude/10 dark:text-lime-bright"
                        : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
                    }`}
                  >
                    Assign Bulk (Grup)
                  </button>
                </div>
              </div>

              {/* Target picker */}
              {formData.mode === "INDIVIDUAL" ? (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Pilih Anggota ({formData.selectedMemberIds.length} dipilih)
                  </label>
                  {members.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Belum ada anggota.
                    </div>
                  ) : (
                    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border border-dashboard-border p-2">
                      {members.map((m) => {
                        const checked = formData.selectedMemberIds.includes(
                          m.access_id
                        );
                        return (
                          <label
                            key={m.access_id}
                            className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition ${
                              checked
                                ? "bg-hijau-t dark:bg-claude/10"
                                : "hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleMember(m.access_id)}
                              className="size-4"
                            />
                            <div className="flex flex-1 flex-col">
                              <span className="font-medium dark:text-white">
                                {m.user.full_name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {m.user.email}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Pilih Grup ({formData.selectedGroupIds.length} dipilih)
                  </label>
                  {groups.length === 0 ? (
                    <div className="text-sm text-gray-500">Belum ada grup.</div>
                  ) : (
                    <div className="flex flex-col gap-1 rounded-md border border-dashboard-border p-2">
                      {groups.map((g) => {
                        const checked = formData.selectedGroupIds.includes(
                          g.id
                        );
                        return (
                          <label
                            key={g.id}
                            className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition ${
                              checked
                                ? "bg-hijau-t dark:bg-claude/10"
                                : "hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleGroup(g.id)}
                              className="size-4"
                            />
                            <div className="flex flex-1 items-center justify-between">
                              <span className="font-medium dark:text-white">
                                {g.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {members.length} anggota
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Deadline */}
              <div className="grid grid-cols-2 gap-2">
                <InputAILN
                  inputId="assignment-deadline-date"
                  inputName="Tanggal Deadline"
                  inputType="date"
                  variant="CHAMPION"
                  value={formData.deadlineDate}
                  onInputChange={handleInputChange("deadlineDate")}
                  required
                />
                <InputAILN
                  inputId="assignment-deadline-time"
                  inputName="Jam"
                  inputType="time"
                  variant="CHAMPION"
                  value={formData.deadlineTime}
                  onInputChange={handleInputChange("deadlineTime")}
                  required
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <TextAreaAILN
                  textAreaId="assignment-message"
                  textAreaName="Catatan untuk anggota (opsional)"
                  variant="CHAMPION"
                  value={formData.message}
                  onTextAreaChange={handleInputChange("message")}
                  textAreaHeight="h-20"
                  characterLength={500}
                  textAreaPlaceholder="Tambahkan catatan atau instruksi khusus…"
                />
                <div className="self-end text-xs text-gray-400">
                  {formData.message.length}/500
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-40 flex w-full flex-col gap-1 border-t border-dashboard-border bg-background p-4">
          <ButtonAILN
            type="button"
            variant="champion"
            className="w-full"
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            <Plus className="size-4" />
            {isSubmitting
              ? "Menyimpan…"
              : `${formData.assignEnabled ? "Buat & Assign" : "Buat"} ${
                  formData.kind === "PROMPT" ? "Prompt" : "Use Case"
                }`}
          </ButtonAILN>
          <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">
            Item akan ditambahkan ke library{" "}
            {formData.kind === "PROMPT" ? "Prompt (L2)" : "Use Case (L3)"}.
          </p>
        </div>
      </form>
    </SheetAILN>
  );
}
