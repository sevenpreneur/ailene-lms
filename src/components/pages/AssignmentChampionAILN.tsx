"use client";
import AssignFormChampionAILN from "@/components/forms/AssignFormChampionAILN";
import CreateAssignmentFormAILN from "@/components/forms/CreateAssignmentFormAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import InputAILN from "@/components/fields/InputAILN";
import AssignmentItemChampion from "@/components/items/AssignmentItemChampion";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import type { TeamMembers } from "@/apis/champion";
import type { Category } from "@/apis/categories";
import type { PromptLibraryItem } from "@/apis/prompts";
import type { UseCaseLibraryItem } from "@/apis/use-cases";
import { BookOpen, Plus, Search, Send } from "lucide-react";
import { useState } from "react";

type AssignmentTab = "PROMPT" | "USE_CASE";

export default function AssignmentChampionAILN({
  prompts,
  useCases,
  teamMembers,
  categories,
  group,
}: {
  prompts: PromptLibraryItem[];
  useCases: UseCaseLibraryItem[];
  teamMembers: TeamMembers | null;
  categories: Category[];
  group: { id: number; name: string } | null;
}) {
  const [tab, setTab] = useState<AssignmentTab>("PROMPT");
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<number | null>(
    null
  );
  const [assignOpen, setAssignOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const members = teamMembers?.list ?? [];

  const q = search.trim().toLowerCase();
  const filteredPrompts = q
    ? prompts.filter((p) => p.name.toLowerCase().includes(q))
    : prompts;
  const filteredUseCases = q
    ? useCases.filter((u) => u.name.toLowerCase().includes(q))
    : useCases;

  const selectedPrompt =
    selectedPromptId !== null
      ? prompts.find((p) => p.id === selectedPromptId)
      : prompts[0];
  const selectedUseCase =
    selectedUseCaseId !== null
      ? useCases.find((u) => u.id === selectedUseCaseId)
      : useCases[0];

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Assignment"
          desc="Kelola prompt & use case dan assign ke tim Anda."
        >
          <ButtonAILN
            type="button"
            variant="champion"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            Buat Assignment
          </ButtonAILN>
        </PageHeaderAILN>

        {/* Tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashboard-border">
          <div className="flex items-center">
            <TabButton
              active={tab === "PROMPT"}
              label="Prompt"
              count={prompts.length}
              onClick={() => setTab("PROMPT")}
            />
            <TabButton
              active={tab === "USE_CASE"}
              label="Use Case"
              count={useCases.length}
              onClick={() => setTab("USE_CASE")}
            />
          </div>
          <div className="w-full pb-2 sm:w-64">
            <InputAILN
              inputId="assignment-search"
              inputType="text"
              variant="CHAMPION"
              inputIcon={<Search className="size-4" />}
              inputPlaceholder="Cari assignment…"
              value={search}
              onInputChange={setSearch}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            {/* Grid of items */}
            <div className="flex flex-col gap-3">
              {tab === "PROMPT" ? (
                filteredPrompts.length === 0 ? (
                  <EmptyState label="Belum ada prompt." />
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredPrompts.map((p) => (
                      <AssignmentItemChampion
                        key={p.id}
                        levelNumber={p.level_number}
                        name={p.name}
                        body={p.description}
                        categories={p.categories}
                        isSelected={selectedPrompt?.id === p.id}
                        onClick={() => setSelectedPromptId(p.id)}
                      />
                    ))}
                  </div>
                )
              ) : filteredUseCases.length === 0 ? (
                <EmptyState label="Belum ada use case." />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredUseCases.map((u) => (
                    <AssignmentItemChampion
                      key={u.id}
                      levelNumber={u.level_number}
                      name={u.name}
                      body={u.description}
                      categories={u.categories}
                      isSelected={selectedUseCase?.id === u.id}
                      onClick={() => setSelectedUseCaseId(u.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Preview panel */}
            <SectionContainerAILN
              title={`Preview ${tab === "PROMPT" ? "Prompt" : "Use Case"}`}
              className="lg:sticky lg:top-6 lg:self-start"
            >
              {tab === "PROMPT" ? (
                selectedPrompt ? (
                  <>
                    <PreviewBody
                      levelNumber={selectedPrompt.level_number}
                      title={selectedPrompt.name}
                      categories={selectedPrompt.categories}
                      sections={[
                        {
                          label: "Skenario",
                          text: selectedPrompt.description,
                        },
                      ]}
                    />
                    <div className="mt-4 border-t border-dashboard-border pt-4">
                      <ButtonAILN
                        type="button"
                        variant="champion"
                        className="w-full"
                        onClick={() => setAssignOpen(true)}
                      >
                        <Send className="size-4" />
                        Assign to Team
                      </ButtonAILN>
                    </div>
                  </>
                ) : (
                  <PreviewEmpty />
                )
              ) : selectedUseCase ? (
                <>
                  <PreviewBody
                    levelNumber={selectedUseCase.level_number}
                    title={selectedUseCase.name}
                    categories={selectedUseCase.categories}
                    sections={[
                      {
                        label: "Deskripsi",
                        text: selectedUseCase.description,
                      },
                    ]}
                  />
                  <div className="mt-4 border-t border-dashboard-border pt-4">
                    <ButtonAILN
                      type="button"
                      variant="champion"
                      className="w-full"
                      onClick={() => setAssignOpen(true)}
                    >
                      <Send className="size-4" />
                      Assign to Team
                    </ButtonAILN>
                  </div>
                </>
              ) : (
                <PreviewEmpty />
              )}
            </SectionContainerAILN>
          </div>
      </div>

      <AssignFormChampionAILN
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        kind={tab}
        item={
          tab === "PROMPT"
            ? selectedPrompt
              ? { id: selectedPrompt.id, name: selectedPrompt.name }
              : null
            : selectedUseCase
              ? { id: selectedUseCase.id, name: selectedUseCase.name }
              : null
        }
        members={members}
        group={group}
      />

      <CreateAssignmentFormAILN
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        members={members}
        group={group}
        categories={categories}
      />
    </PageContainerAILN>
  );
}

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px inline-flex h-12 cursor-pointer items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${
        active
          ? "border-claude text-claude dark:border-claude dark:text-lime-bright"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white ${
          active ? "bg-claude" : "bg-gray-400 dark:bg-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function PreviewBody({
  levelNumber,
  title,
  categories,
  sections,
}: {
  levelNumber: number;
  title: string;
  categories: Category[];
  sections: { label: string; text: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <GeneralLabelAILN variant="green">Level {levelNumber}</GeneralLabelAILN>
        {categories.map((c) => (
          <GeneralLabelAILN key={c.id} variant="white">
            {c.name}
          </GeneralLabelAILN>
        ))}
      </div>
      <h2 className="text-base font-bold dark:text-white">{title}</h2>
      {sections.map((s) => (
        <div key={s.label} className="flex flex-col gap-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {s.label}
          </div>
          <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200">
            {s.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function PreviewEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400 dark:text-gray-500">
      <BookOpen className="size-8" />
      <div className="text-sm">Pilih item untuk melihat detail</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border py-12 text-center text-gray-500 dark:text-gray-400">
      <BookOpen className="size-6" />
      <div className="text-sm">{label}</div>
    </div>
  );
}
