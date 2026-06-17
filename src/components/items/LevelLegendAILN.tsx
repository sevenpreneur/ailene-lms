import { levelColorByCode } from "@/lib/ailene-level-colors";

/**
 * Compact horizontal legend mapping each level to its maturity-ramp color. Used
 * as the section header-right for the org level distribution.
 */
export default function LevelLegendAILN({
  levels,
}: {
  levels: { id: number; code: string; label?: string; name: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] text-muted-foreground">
      {levels.map((level) => (
        <span key={level.id} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-sm"
            style={{ backgroundColor: levelColorByCode(level.code) }}
          />
          {level.label ?? level.code} {level.name}
        </span>
      ))}
    </div>
  );
}
