"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
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
    <ButtonAILN
      variant={isSelected ? "cardActive" : "card"}
      size="card"
      width="full"
      type="button"
      onClick={onClick}
    >
      <div className="flex items-start">
        <GeneralLabelAILN variant="green">Level {levelNumber}</GeneralLabelAILN>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium line-clamp-2 dark:text-white">
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
    </ButtonAILN>
  );
}
