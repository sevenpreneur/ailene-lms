"use client";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";

interface CategoryRef {
  id: number;
  name: string;
}

export default function AssignmentItemChampion({
  levelNumber,
  name,
  body,
  categories,
  isSelected,
  onClick,
}: {
  levelNumber: number;
  name: string;
  body: string;
  categories: CategoryRef[];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-3 rounded-lg border bg-card-1 p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-500/[0.04] ${
        isSelected
          ? "border-emerald-500 ring-1 ring-emerald-500 dark:border-emerald-400 dark:ring-emerald-400"
          : "border-dashboard-border"
      }`}
    >
      <div className="flex items-start">
        <GeneralLabelAILN variant="green">Level {levelNumber}</GeneralLabelAILN>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold line-clamp-2 dark:text-white">
          {name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-3 dark:text-gray-400">
          {body}
        </p>
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <GeneralLabelAILN key={c.id} variant="white">
              {c.name}
            </GeneralLabelAILN>
          ))}
        </div>
      )}
    </button>
  );
}
