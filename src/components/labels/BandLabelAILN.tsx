import type { PreAssessmentBand } from "@/apis/pre-assessment";

// A member's CFTE band; green once it reaches the program target.
export default function BandLabelAILN({
  band,
  meetsTarget,
}: {
  band: PreAssessmentBand;
  meetsTarget: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
        meetsTarget
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
          : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
      }`}
      title={`Band ${band.band} · Level ${band.level}`}
    >
      <span className="tabular-nums">B{band.band}</span>
      <span className="font-normal">{band.name}</span>
    </span>
  );
}
