"use client";
import AssignFormChampionAILN from "@/components/forms/AssignFormChampionAILN";
import AiAssignmentComposerAILN from "@/components/forms/AiAssignmentComposerAILN";
import CreateAssignmentFormAILN from "@/components/forms/CreateAssignmentFormAILN";
import CreateGuidedUseCaseFormAILN from "@/components/forms/CreateGuidedUseCaseFormAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import Tabs from "@/components/navigations/Tabs";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import InputAILN from "@/components/fields/InputAILN";
import AssignmentItemChampion from "@/components/items/AssignmentItemChampion";
import AiDraftBatchesAILN from "@/components/indexes/AiDraftBatchesAILN";
import type {
  AssignmentDraft,
  AssignmentDraftBatch,
  TeamMembers,
} from "@/apis/champion";
import type { Category } from "@/apis/categories";
import type { UseCaseLibraryItem } from "@/apis/use-cases";
import { Compass, Plus, Search, Send, Sparkles } from "lucide-react";
import { useState } from "react";

type AssignmentTab = "AI" | "USE_CASE";
export default function AssignmentChampionAILN({
  useCases,
  teamMembers,
  categories,
  draftBatches,
  group,
}: {
  useCases: UseCaseLibraryItem[];
  teamMembers: TeamMembers | null;
  categories: Category[];
  draftBatches: AssignmentDraftBatch[];
  group: { id: number; name: string } | null;
}) {
  const [tab, setTab] = useState<AssignmentTab>("AI");
  const [batches, setBatches] = useState(draftBatches);
  const [previous, setPrevious] = useState(draftBatches);
  const [freshBatchIds, setFreshBatchIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [draft, setDraft] = useState<AssignmentDraft | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState("");
  if (draftBatches !== previous) {
    setPrevious(draftBatches);
    setBatches(draftBatches);
  }
  const members = teamMembers?.list ?? [];
  const selected =
    useCases.find((item) => item.id === selectedId) ?? useCases[0];
  const visible = useCases.filter((item) =>
    item.name
      .toLocaleLowerCase("id")
      .includes(search.trim().toLocaleLowerCase("id")),
  );
  function openCreate(next: AssignmentDraft | null) {
    if (next && next.kind !== "USE_CASE") return;
    setDraft(next);
    setFormKey((key) => key + 1);
    setCreateOpen(true);
  }
  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Tugas"
          desc="Siapkan dan berikan Use Case untuk tim."
        >
          <ButtonAILN variant="outline" onClick={() => setGuidedOpen(true)}>
            <Compass className="size-4" />
            Use Case Terpandu
          </ButtonAILN>
          <ButtonAILN variant="champion" onClick={() => openCreate(null)}>
            <Plus className="size-4" />
            Buat Manual
          </ButtonAILN>
        </PageHeaderAILN>
        <Tabs<AssignmentTab>
          ariaLabel="Sumber tugas Use Case"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              value: "AI",
              label: "Buat dengan AI",
              icon: <Sparkles className="size-4" />,
              badge: batches.length,
            },
            {
              value: "USE_CASE",
              label: "Use Case Library",
              badge: useCases.length,
            },
          ]}
        />
        {tab === "AI" ? (
          <>
            <AiAssignmentComposerAILN
              onGenerated={(batch) => {
                const filtered = {
                  ...batch,
                  drafts: batch.drafts.filter(
                    (item) => item.kind === "USE_CASE",
                  ),
                };
                if (!filtered.drafts.length) return;
                setBatches((items) => [
                  filtered,
                  ...items.filter((item) => item.batch_id !== batch.batch_id),
                ]);
                setFreshBatchIds((ids) => [...ids, batch.batch_id]);
              }}
            />
            <AiDraftBatchesAILN
              batches={batches}
              freshBatchIds={freshBatchIds}
              categories={categories}
              onUse={openCreate}
              onDeleted={(id) =>
                setBatches((items) =>
                  items
                    .map((batch) => ({
                      ...batch,
                      drafts: batch.drafts.filter((item) => item.id !== id),
                    }))
                    .filter((batch) => batch.drafts.length > 0),
                )
              }
            />
          </>
        ) : (
          <>
            <InputAILN
              inputId="assignment-search"
              inputName="Cari use case"
              inputType="search"
              variant="CHAMPION"
              inputIcon={<Search className="size-4" />}
              value={search}
              onInputChange={setSearch}
            />
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="grid content-start gap-3 md:grid-cols-2">
                {visible.length ? (
                  visible.map((item) => (
                    <AssignmentItemChampion
                      key={item.id}
                      levelNumber={item.level_number}
                      name={item.name}
                      body={item.description}
                      categories={item.categories}
                      isSelected={selected?.id === item.id}
                      onClick={() => setSelectedId(item.id)}
                    />
                  ))
                ) : (
                  <p role="status" className="text-sm text-muted-foreground">
                    {search
                      ? "Tidak ada use case yang cocok."
                      : "Belum ada use case di library."}
                  </p>
                )}
              </div>
              <SectionContainerAILN
                title="Detail Use Case"
                className="xl:sticky xl:top-6 xl:self-start"
              >
                {selected ? (
                  <div className="flex flex-col gap-4">
                    <h2 className="text-base font-medium">{selected.name}</h2>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {selected.description}
                    </p>
                    <ButtonAILN
                      variant="champion"
                      onClick={() => setAssignOpen(true)}
                    >
                      <Send className="size-4" />
                      Berikan ke Tim
                    </ButtonAILN>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pilih use case untuk melihat detail.
                  </p>
                )}
              </SectionContainerAILN>
            </div>
          </>
        )}
        <AssignFormChampionAILN
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          item={selected ? { id: selected.id, name: selected.name } : null}
          members={members}
          group={group}
        />
        <CreateGuidedUseCaseFormAILN
          isOpen={guidedOpen}
          onClose={() => setGuidedOpen(false)}
          members={members}
          categories={categories}
        />
        <CreateAssignmentFormAILN
          key={formKey}
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          members={members}
          group={group}
          categories={categories}
          draft={draft}
        />
      </div>
    </PageContainerAILN>
  );
}
