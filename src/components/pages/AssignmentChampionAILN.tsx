"use client";
import AssignFormChampionAILN from "@/components/forms/AssignFormChampionAILN";
import CreateAssignmentFormAILN from "@/components/forms/CreateAssignmentFormAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import InputAILN from "@/components/fields/InputAILN";
import AssignmentItemChampion from "@/components/items/AssignmentItemChampion";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import { setSessionToken, trpc } from "@/trpc/client";
import { BookOpen, Plus, Search, Send } from "lucide-react";
import { useEffect, useState } from "react";

type AssignmentTab = "PROMPT" | "USE_CASE";

interface CategoryRef {
  id: number;
  name: string;
}
interface LevelRef {
  id: number;
  level_number: number;
  name: string;
}

interface PromptItem {
  id: number;
  name: string;
  scenario: string;
  expected_output: string;
  level: LevelRef;
  categories: CategoryRef[];
}

interface UseCaseItem {
  id: number;
  name: string;
  description: string;
  level: LevelRef;
  categories: CategoryRef[];
}

export default function AssignmentChampionAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const [tab, setTab] = useState<AssignmentTab>("PROMPT");
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<number | null>(
    null
  );
  const [assignOpen, setAssignOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const promptQ = trpc.list.promptLibrary.useQuery(undefined);
  const useCaseQ = trpc.list.useCaseLibrary.useQuery(undefined);

  const prompts = (promptQ.data?.list ?? []) as PromptItem[];
  const useCases = (useCaseQ.data?.list ?? []) as UseCaseItem[];

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

  const isLoading = tab === "PROMPT" ? promptQ.isLoading : useCaseQ.isLoading;
  const error = tab === "PROMPT" ? promptQ.error : useCaseQ.error;

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

        {error ? (
          <AppErrorComponents />
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            {/* Grid of items */}
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <AssignmentGridSkeleton />
              ) : tab === "PROMPT" ? (
                filteredPrompts.length === 0 ? (
                  <EmptyState label="Belum ada prompt." />
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredPrompts.map((p) => (
                      <AssignmentItemChampion
                        key={p.id}
                        levelNumber={p.level.level_number}
                        name={p.name}
                        body={p.scenario}
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
                      levelNumber={u.level.level_number}
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
              className="sticky top-6 self-start"
            >
              {tab === "PROMPT" ? (
                selectedPrompt ? (
                  <>
                    <PreviewBody
                      levelNumber={selectedPrompt.level.level_number}
                      title={selectedPrompt.name}
                      categories={selectedPrompt.categories}
                      sections={[
                        { label: "Skenario", text: selectedPrompt.scenario },
                        {
                          label: "Expected Output",
                          text: selectedPrompt.expected_output,
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
                    levelNumber={selectedUseCase.level.level_number}
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
        )}
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
      />

      <CreateAssignmentFormAILN
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
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
          ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white ${
          active ? "bg-emerald-600" : "bg-gray-400 dark:bg-gray-600"
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
  categories: CategoryRef[];
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

function AssignmentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1"
        />
      ))}
    </div>
  );
}
