"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import SheetAILN from "@/components/modals/SheetAILN";
import { trpc } from "@/trpc/client";
import dayjs from "dayjs";
import { Loader2, Plus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";

type AssignmentKind = "PROMPT" | "USE_CASE";
type TargetMode = "INDIVIDUAL" | "BULK";
type CategoryOption = { value: number; label: string };

interface CreateAssignmentFormAILNProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAssignmentFormAILN({
  isOpen,
  onClose,
}: CreateAssignmentFormAILNProps) {
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState<{
    kind: AssignmentKind;
    name: string;
    description: string;
    expectedOutput: string;
    selectedCategoryIds: number[];
    assignEnabled: boolean;
    mode: TargetMode;
    selectedMemberIds: number[];
    selectedGroupIds: number[];
    deadlineDate: string;
    deadlineTime: string;
    message: string;
  }>({
    kind: "PROMPT",
    name: "",
    description: "",
    expectedOutput: "",
    selectedCategoryIds: [],
    assignEnabled: false,
    mode: "INDIVIDUAL",
    selectedMemberIds: [],
    selectedGroupIds: [],
    deadlineDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
    deadlineTime: "23:59",
    message: "",
  });

  // Curried single-field updater: handleInputChange("name")(value)
  const handleInputChange = (fieldName: string) => (value: unknown) =>
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

  const categoriesQ = trpc.ailene.list.categories.useQuery(undefined, {
    enabled: isOpen,
  });
  const memberQ = trpc.auth.checkAilMember.useQuery(undefined, {
    enabled: isOpen && formData.assignEnabled,
  });
  const membersQ = trpc.ailene.list.members.useQuery(
    {},
    { enabled: isOpen && formData.assignEnabled }
  );

  const createPromptM = trpc.ailene.create.promptAssignment.useMutation();
  const createUseCaseM = trpc.ailene.create.useCaseAssignment.useMutation();
  const isSubmitting = createPromptM.isPending || createUseCaseM.isPending;

  const categories = useMemo(
    () => categoriesQ.data?.list ?? [],
    [categoriesQ.data?.list]
  );
  const groups = memberQ.data?.ail_member?.championed_groups ?? [];
  const members = membersQ.data?.list ?? [];

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
  const toggleMember = (id: number) =>
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

  const resetForm = () =>
    setFormData({
      kind: "PROMPT",
      name: "",
      description: "",
      expectedOutput: "",
      selectedCategoryIds: [],
      assignEnabled: false,
      mode: "INDIVIDUAL",
      selectedMemberIds: [],
      selectedGroupIds: [],
      deadlineDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
      deadlineTime: "23:59",
      message: "",
    });

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const {
      kind,
      name,
      description,
      expectedOutput,
      selectedCategoryIds,
      assignEnabled,
      mode,
      selectedMemberIds,
      selectedGroupIds,
      deadlineDate,
      deadlineTime,
      message,
    } = formData;

    if (!name.trim()) {
      toast.error("Nama wajib diisi.");
      return;
    }
    if (!description.trim()) {
      toast.error(
        kind === "PROMPT" ? "Skenario wajib diisi." : "Deskripsi wajib diisi."
      );
      return;
    }
    if (kind === "PROMPT" && !expectedOutput.trim()) {
      toast.error("Expected output wajib diisi.");
      return;
    }
    if (selectedCategoryIds.length === 0) {
      toast.error("Pilih minimal 1 kategori.");
      return;
    }

    let assignment: {
      target_type: "MEMBER" | "GROUP";
      target_ids: number[];
      deadline: string;
      message: string | null;
    } | null = null;

    if (assignEnabled) {
      if (mode === "INDIVIDUAL" && selectedMemberIds.length === 0) {
        toast.error("Pilih minimal 1 anggota.");
        return;
      }
      if (mode === "BULK" && selectedGroupIds.length === 0) {
        toast.error("Pilih minimal 1 grup.");
        return;
      }
      const deadlineISO = dayjs(
        `${deadlineDate}T${deadlineTime}`
      ).toISOString();
      if (dayjs(deadlineISO).isBefore(dayjs())) {
        toast.error("Deadline harus di masa depan.");
        return;
      }
      assignment = {
        target_type: mode === "INDIVIDUAL" ? "MEMBER" : "GROUP",
        target_ids:
          mode === "INDIVIDUAL" ? selectedMemberIds : selectedGroupIds,
        deadline: deadlineISO,
        message: message.trim() || null,
      };
    }

    const label = kind === "PROMPT" ? "Prompt" : "Use Case";

    if (kind === "PROMPT") {
      createPromptM.mutate(
        {
          name: name.trim(),
          description: description.trim(),
          expected_output: expectedOutput.trim(),
          category_ids: selectedCategoryIds,
          assignment,
        },
        {
          onSuccess: (data) => {
            if (assignment) {
              toast.success(
                `${label} dibuat & di-assign ke ${data.assigned_count} anggota.`
              );
            } else {
              toast.success(`${label} berhasil dibuat.`);
            }
            utils.ailene.list.promptLibrary.invalidate();
            utils.ailene.list.promptSubmissions.invalidate();
            resetForm();
            onClose();
          },
          onError: (err) => {
            toast.error("Gagal membuat prompt", { description: err.message });
          },
        }
      );
    } else {
      createUseCaseM.mutate(
        {
          name: name.trim(),
          description: description.trim(),
          category_ids: selectedCategoryIds,
          assignment,
        },
        {
          onSuccess: (data) => {
            if (assignment) {
              toast.success(
                `${label} dibuat & di-assign ke ${data.assigned_count} anggota.`
              );
            } else {
              toast.success(`${label} berhasil dibuat.`);
            }
            utils.ailene.list.useCaseLibrary.invalidate();
            utils.ailene.list.useCaseSubmissions.invalidate();
            resetForm();
            onClose();
          },
          onError: (err) => {
            toast.error("Gagal membuat use case", {
              description: err.message,
            });
          },
        }
      );
    }
  };

  return (
    <SheetAILN
      isOpen={isOpen}
      onClose={handleClose}
      sheetName="Buat Assignment Baru"
      sheetDescription="Tambah prompt atau use case ke library, lalu (opsional) assign ke anggota."
    >
      <form
        className="relative flex h-full w-full flex-col"
        onSubmit={handleSubmit}
      >
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
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
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
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
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
                    isFocused ? "border-emerald-500" : "border-dashboard-border"
                  }`,
                valueContainer: () => "flex flex-wrap gap-1 py-0.5",
                placeholder: () => "px-1 text-gray-400 dark:text-gray-500",
                input: () => "px-1 text-sm dark:text-gray-200",
                multiValue: () =>
                  "inline-flex items-center overflow-hidden rounded-md bg-emerald-50 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                multiValueLabel: () => "py-0.5 pl-2",
                multiValueRemove: () =>
                  "flex items-center px-1 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-500/20",
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
                        ? "cursor-pointer bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
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
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
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
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
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
                  {membersQ.isLoading ? (
                    <div className="text-sm text-gray-500">Memuat…</div>
                  ) : members.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Belum ada anggota.
                    </div>
                  ) : (
                    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border border-dashboard-border p-2">
                      {members.map((m) => {
                        const checked = formData.selectedMemberIds.includes(
                          m.member_id
                        );
                        return (
                          <label
                            key={m.member_id}
                            className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition ${
                              checked
                                ? "bg-emerald-50 dark:bg-emerald-500/10"
                                : "hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleMember(m.member_id)}
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
                  {memberQ.isLoading ? (
                    <div className="text-sm text-gray-500">Memuat…</div>
                  ) : groups.length === 0 ? (
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
                                ? "bg-emerald-50 dark:bg-emerald-500/10"
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
                                {g._count?.members ?? 0} anggota
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
        <div className="sticky bottom-0 z-40 flex w-full flex-col gap-1 border-t border-dashboard-border bg-sb-bg p-4">
          <ButtonAILN
            type="submit"
            variant="secondary"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              <>
                <Plus className="size-4" />
                {formData.assignEnabled ? "Buat & Assign" : "Buat"}{" "}
                {formData.kind === "PROMPT" ? "Prompt" : "Use Case"}
              </>
            )}
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
