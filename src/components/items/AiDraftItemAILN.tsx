"use client";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import type { AssignmentDraft } from "@/apis/champion";
import type { Category } from "@/apis/categories";
import { CheckCircle2 } from "lucide-react";

export default function AiDraftItemAILN({
  draft,
  categories,
  isSelected,
  onClick,
}: {
  draft: AssignmentDraft;
  categories: Category[];
  isSelected: boolean;
  onClick: () => void;
}) {
  const draftCategories = categories.filter((c) =>
    draft.category_ids.includes(c.id)
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-3 rounded-lg border bg-card-1 p-4 text-left transition hover:border-claude/60 hover:bg-claude/[0.04] ${
        isSelected
          ? "border-claude ring-1 ring-claude dark:border-claude dark:ring-claude"
          : "border-dashboard-border"
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <GeneralLabelAILN variant="green">
          {draft.kind === "PROMPT" ? "Prompt · L2" : "Use Case · L3"}
        </GeneralLabelAILN>
        {draft.angle && (
          <GeneralLabelAILN variant="blue">{draft.angle}</GeneralLabelAILN>
        )}
        {draft.used_at && (
          <GeneralLabelAILN
            variant="white"
            icon={<CheckCircle2 className="size-3" />}
          >
            Sudah dipakai
          </GeneralLabelAILN>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-bold text-foreground">
          {draft.name}
        </h3>
        <p className="line-clamp-3 text-xs text-muted-foreground">
          {draft.description}
        </p>
      </div>
      {draftCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {draftCategories.map((c) => (
            <GeneralLabelAILN key={c.id} variant="white">
              {c.name}
            </GeneralLabelAILN>
          ))}
        </div>
      )}
    </button>
  );
}
