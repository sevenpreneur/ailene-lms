import { scoreTone } from "@/lib/pre-assessment";

const TONE_CHIP = {
  high: "bg-emerald-200 text-emerald-800 dark:bg-emerald-400/25 dark:text-emerald-200",
  mid: "bg-amber-200 text-amber-800 dark:bg-amber-400/25 dark:text-amber-200",
  low: "bg-red-200 text-red-800 dark:bg-red-400/25 dark:text-red-200",
};

// One 0-100 cluster score; a null score (not measured yet) renders as a dash.
export default function ClusterScoreChipAILN({
  score,
  weakest,
}: {
  score: number | null;
  weakest?: boolean;
}) {
  if (score === null) {
    return <span className="text-sm text-gray-400 dark:text-gray-500">–</span>;
  }
  return (
    <span
      className={`inline-flex h-8 min-w-10 items-center justify-center rounded-lg px-1.5 text-sm font-medium tabular-nums ${
        TONE_CHIP[scoreTone(score)]
      } ${weakest ? "ring-2 ring-amber-500/70 ring-offset-1 ring-offset-card-1" : ""}`}
      title={weakest ? "Area terlemah anggota ini" : undefined}
    >
      {Math.round(score)}
    </span>
  );
}
