import { cn } from "@/lib/utils";

export default function GuidedProgressGaugeAILN({
  value,
  total,
  label,
  large = false,
}: {
  value: number;
  total: number;
  label: string;
  large?: boolean;
}) {
  const progress = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        large ? "size-14" : "size-11",
      )}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          className="text-dashboard-border"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          pathLength="100"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset={100 - progress * 100}
          className="text-claude transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none dark:text-lime-bright"
        />
      </svg>
      <span
        aria-hidden="true"
        className="flex items-baseline gap-0.5 font-headline text-sm font-medium"
      >
        {value}
        <span className="font-sans text-[10px] font-normal text-muted-foreground">
          /{total}
        </span>
      </span>
    </span>
  );
}
