"use client";

interface RatingScaleAILNProps {
  id: string;
  question: string;
  lowLabel: string;
  highLabel: string;
  value: number | null;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const SCALE = [1, 2, 3, 4, 5];

export default function RatingScaleAILN({
  id,
  question,
  lowLabel,
  highLabel,
  value,
  disabled,
  onChange,
}: RatingScaleAILNProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend id={id} className="mb-3 text-sm font-medium text-foreground">
        {question}
        <span className="text-destructive"> *</span>
      </legend>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="grid grid-cols-5 gap-2"
      >
        {SCALE.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(n)}
              className={`flex h-11 items-center justify-center rounded-lg border-[1.5px] text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? "border-claude bg-claude text-white"
                  : "border-dashboard-border bg-card-2 text-gray-700 hover:border-claude/40 dark:text-gray-300"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </fieldset>
  );
}
