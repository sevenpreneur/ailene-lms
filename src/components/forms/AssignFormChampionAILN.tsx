"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import SheetAILN from "@/components/modals/SheetAILN";
import type { TeamMember } from "@/apis/champion";
import { useProjectId } from "@/lib/use-project-id";
import dayjs from "dayjs";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type AssignKind = "PROMPT" | "USE_CASE";

interface AssignFormChampionAILNProps {
  isOpen: boolean;
  onClose: () => void;
  kind: AssignKind;
  item: { id: number; name: string } | null;
  members: TeamMember[];
  group: { id: number; name: string } | null;
}

type TargetMode = "INDIVIDUAL" | "BULK";

export default function AssignFormChampionAILN({
  isOpen,
  onClose,
  kind,
  item,
  members,
  group,
}: AssignFormChampionAILNProps) {
  const projectId = useProjectId();
  const router = useRouter();
  // A champion leads exactly one group, so bulk mode targets only that group.
  const groups = group ? [group] : [];

  const [mode, setMode] = useState<TargetMode>("INDIVIDUAL");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState(
    dayjs().add(7, "day").format("YYYY-MM-DD")
  );
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [message, setMessage] = useState("");

  const toggleMember = (id: string) =>
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const toggleGroup = (id: number) =>
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAssign = async () => {
    if (isSubmitting || !item) return;

    const deadline = dayjs(`${deadlineDate}T${deadlineTime}`);
    if (!deadline.isValid() || deadline.isBefore(dayjs())) {
      toast.error("Deadline harus di masa depan.");
      return;
    }

    const isMember = mode === "INDIVIDUAL";
    if (isMember && selectedMemberIds.length === 0) {
      toast.error("Pilih minimal satu anggota.");
      return;
    }
    if (!isMember && selectedGroupIds.length === 0) {
      toast.error("Pilih minimal satu grup.");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint =
        kind === "PROMPT"
          ? "/api/champion/prompts/assign"
          : "/api/champion/use-cases/assign";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          library_id: item.id,
          target_type: isMember ? "MEMBER" : "GROUP",
          ...(isMember
            ? { target_access_ids: selectedMemberIds }
            : { target_group_ids: selectedGroupIds }),
          deadline: deadline.toISOString(),
          message: message.trim() || null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.message ?? "Gagal assign. Coba lagi.");
        return;
      }

      const skipped = payload?.skipped ?? 0;
      toast.success(
        `${payload?.assigned_count ?? 0} anggota di-assign` +
          (skipped > 0 ? ` · ${skipped} sudah punya tugas ini` : "")
      );
      onClose();
      router.refresh();
    } catch {
      toast.error("Gagal assign. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SheetAILN
      isOpen={isOpen}
      onClose={onClose}
      sheetName={`Assign ${kind === "PROMPT" ? "Prompt" : "Use Case"}`}
      sheetDescription={item?.name ?? ""}
    >
      <form className="relative flex h-full w-full flex-col">
        <div className="flex h-full flex-col gap-5 overflow-y-auto px-6 pb-28">
          {/* Target mode toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("INDIVIDUAL")}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  mode === "INDIVIDUAL"
                    ? "border-claude bg-hijau-t text-claude dark:bg-claude/10 dark:text-lime-bright"
                    : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
                }`}
              >
                Assign Individual
              </button>
              <button
                type="button"
                onClick={() => setMode("BULK")}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  mode === "BULK"
                    ? "border-claude bg-hijau-t text-claude dark:bg-claude/10 dark:text-lime-bright"
                    : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
                }`}
              >
                Assign Bulk (Grup)
              </button>
            </div>
          </div>

          {/* Target picker */}
          {mode === "INDIVIDUAL" ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Pilih Anggota ({selectedMemberIds.length} dipilih)
              </label>
              {members.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada anggota.</div>
              ) : (
                <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border border-dashboard-border p-2">
                  {members.map((m) => {
                    const checked = selectedMemberIds.includes(m.access_id);
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
                Pilih Grup ({selectedGroupIds.length} dipilih)
              </label>
              {groups.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada grup.</div>
              ) : (
                <div className="flex flex-col gap-1 rounded-md border border-dashboard-border p-2">
                  {groups.map((g) => {
                    const checked = selectedGroupIds.includes(g.id);
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
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Deadline
            </label>
            <div className="grid grid-cols-2 gap-2">
              <InputAILN
                inputId="assign-deadline-date"
                inputType="date"
                variant="CHAMPION"
                value={deadlineDate}
                onInputChange={setDeadlineDate}
                required
              />
              <InputAILN
                inputId="assign-deadline-time"
                inputType="time"
                variant="CHAMPION"
                value={deadlineTime}
                onInputChange={setDeadlineTime}
                required
              />
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Catatan untuk anggota (opsional)
            </label>
            <TextAreaAILN
              textAreaId="assign-message"
              textAreaPlaceholder="Tambahkan catatan atau instruksi khusus…"
              textAreaHeight="h-24"
              characterLength={500}
              variant="CHAMPION"
              value={message}
              onTextAreaChange={setMessage}
            />
            <div className="self-end text-xs text-gray-400">
              {message.length}/500
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-40 flex w-full flex-col gap-1 border-t border-dashboard-border bg-background p-4">
          <ButtonAILN
            type="button"
            variant="champion"
            className="w-full"
            onClick={handleAssign}
            disabled={isSubmitting}
          >
            <Send className="size-4" />
            {isSubmitting
              ? "Mengirim…"
              : `Assign ${kind === "PROMPT" ? "Prompt" : "Use Case"}`}
          </ButtonAILN>
          <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">
            Anggota akan menerima notifikasi di dashboard mereka.
          </p>
        </div>
      </form>
    </SheetAILN>
  );
}
