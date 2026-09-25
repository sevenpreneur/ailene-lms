"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import AiDraftItemAILN from "@/components/items/AiDraftItemAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { AssignmentDraft, AssignmentDraftBatch } from "@/apis/champion";
import type { Category } from "@/apis/categories";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { ChevronDown, Send, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

dayjs.extend(relativeTime);

export default function AiDraftBatchesAILN({
  batches,
  freshBatchIds,
  categories,
  onUse,
  onDeleted,
}: {
  batches: AssignmentDraftBatch[];
  freshBatchIds: string[];
  categories: Category[];
  onUse: (draft: AssignmentDraft) => void;
  onDeleted: (draftId: number) => void;
}) {
  const projectId = useProjectId();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [latest, ...history] = batches;
  const [prevLatestId, setPrevLatestId] = useState(latest?.batch_id);

  // A fresh batch takes over the preview from whatever was selected before.
  if (latest?.batch_id !== prevLatestId) {
    setPrevLatestId(latest?.batch_id);
    setSelectedId(null);
  }

  const allDrafts = batches.flatMap((b) => b.drafts);
  const selected =
    allDrafts.find((d) => d.id === selectedId) ?? latest?.drafts[0] ?? null;
  const selectedBatch = selected
    ? batches.find((b) => b.drafts.some((d) => d.id === selected.id))
    : undefined;

  const handleDelete = async (draft: AssignmentDraft) => {
    if (confirmDeleteId !== draft.id) {
      setConfirmDeleteId(draft.id);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch("/api/champion/assignments/drafts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, draft_id: draft.id }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.message ?? "Gagal menghapus draft. Coba lagi.");
        return;
      }
      onDeleted(draft.id);
      setSelectedId(null);
      toast.success("Draft dihapus.");
    } catch {
      toast.error("Gagal menghapus draft. Coba lagi.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  if (!latest) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border py-12 text-center text-muted-foreground">
        <Sparkles className="size-6" />
        <div className="text-sm">
          Belum ada hasil generate. Tulis instruksi di atas untuk mulai.
        </div>
      </div>
    );
  }

  const selectedCategories = selected
    ? categories.filter((c) => selected.category_ids.includes(c.id))
    : [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        {/* Newest batch, kept apart so it never blends into older runs */}
        <div className="flex flex-col gap-3 rounded-xl border-2 border-claude/40 bg-hijau-t/40 p-4 dark:border-claude/50 dark:bg-claude/[0.06]">
          <BatchHeader
            batch={latest}
            title="Hasil Generate Terbaru"
            isFresh={freshBatchIds.includes(latest.batch_id)}
          />
          <DraftGrid
            drafts={latest.drafts}
            categories={categories}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>

        {history.length > 0 && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setHistoryOpen((open) => !open)}
              className="flex items-center gap-2 self-start text-sm font-semibold text-foreground"
            >
              <ChevronDown
                className={`size-4 transition ${historyOpen ? "" : "-rotate-90"}`}
              />
              Riwayat Generate ({history.length})
            </button>
            {historyOpen &&
              history.map((batch) => (
                <div
                  key={batch.batch_id}
                  className="flex flex-col gap-3 rounded-xl border border-dashboard-border p-4"
                >
                  <BatchHeader
                    batch={batch}
                    isFresh={freshBatchIds.includes(batch.batch_id)}
                  />
                  <DraftGrid
                    drafts={batch.drafts}
                    categories={categories}
                    selectedId={selected?.id ?? null}
                    onSelect={setSelectedId}
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      <SectionContainerAILN
        title="Preview Draft"
        className="lg:sticky lg:top-6 lg:self-start"
      >
        {selected ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <GeneralLabelAILN variant="green">
                {selected.kind === "PROMPT" ? "Prompt · L2" : "Use Case · L3"}
              </GeneralLabelAILN>
              {selected.angle && (
                <GeneralLabelAILN variant="blue">
                  {selected.angle}
                </GeneralLabelAILN>
              )}
              {selectedCategories.map((c) => (
                <GeneralLabelAILN key={c.id} variant="white">
                  {c.name}
                </GeneralLabelAILN>
              ))}
            </div>
            <h2 className="text-base font-bold text-foreground">
              {selected.name}
            </h2>
            <PreviewSection
              label={selected.kind === "PROMPT" ? "Skenario" : "Deskripsi"}
              text={selected.description}
            />
            {selected.expected_output && (
              <PreviewSection
                label="Expected Output"
                text={selected.expected_output}
              />
            )}
            {selectedBatch && (
              <p className="rounded-md bg-card-2 p-2 text-xs text-muted-foreground">
                Dari instruksi: “{selectedBatch.instruction}”
              </p>
            )}
            {selected.used_at && (
              <p className="text-xs text-muted-foreground">
                Sudah dipakai {dayjs(selected.used_at).locale("id").fromNow()}.
                Anda tetap bisa memakainya lagi.
              </p>
            )}
            <div className="mt-2 flex flex-col gap-2 border-t border-dashboard-border pt-4">
              <ButtonAILN
                type="button"
                variant="champion"
                className="w-full"
                onClick={() => onUse(selected)}
              >
                <Send className="size-4" />
                Pakai & Assign ke Tim
              </ButtonAILN>
              <ButtonAILN
                type="button"
                variant={
                  confirmDeleteId === selected.id ? "destructive" : "neutral"
                }
                className="w-full"
                onClick={() => handleDelete(selected)}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
                {confirmDeleteId === selected.id
                  ? "Klik lagi untuk menghapus"
                  : "Hapus Draft"}
              </ButtonAILN>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Pilih draft untuk melihat detail
          </div>
        )}
      </SectionContainerAILN>
    </div>
  );
}

function BatchHeader({
  batch,
  title,
  isFresh,
}: {
  batch: AssignmentDraftBatch;
  title?: string;
  isFresh: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        {title && (
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        )}
        {isFresh && (
          <GeneralLabelAILN
            variant="yellow"
            icon={<Sparkles className="size-3" />}
          >
            Baru
          </GeneralLabelAILN>
        )}
        <span className="text-xs text-muted-foreground">
          {batch.drafts.length} variasi ·{" "}
          {dayjs(batch.created_at).locale("id").fromNow()}
        </span>
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">
        “{batch.instruction}”
      </p>
    </div>
  );
}

function DraftGrid({
  drafts,
  categories,
  selectedId,
  onSelect,
}: {
  drafts: AssignmentDraft[];
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {drafts.map((d) => (
        <AiDraftItemAILN
          key={d.id}
          draft={d}
          categories={categories}
          isSelected={selectedId === d.id}
          onClick={() => onSelect(d.id)}
        />
      ))}
    </div>
  );
}

function PreviewSection({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <p className="whitespace-pre-wrap text-sm text-foreground">{text}</p>
    </div>
  );
}
