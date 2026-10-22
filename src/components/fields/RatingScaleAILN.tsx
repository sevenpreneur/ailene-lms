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
            <label
              key={n}
              className="relative flex cursor-pointer items-center justify-center"
            >
              <input
                type="radio"
                name={id}
                value={n}
                checked={selected}
                onChange={() => onChange(n)}
                className="peer sr-only"
                aria-label={`${n} dari 5`}
              />
              <span
                className={`flex min-h-11 w-full items-center justify-center rounded-lg border border-dashboard-border text-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${selected ? "bg-claude text-white" : "bg-card-2 text-foreground"}`}
              >
                {n}
              </span>
            </label>
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
