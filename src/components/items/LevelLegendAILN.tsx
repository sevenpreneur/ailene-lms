// Level maturity color by index → CSS var defined in globals.css (--ailn-level-N).
function levelColor(index: number) {
  return `var(--ailn-level-${Math.min(Math.max(index, 0), 4) + 1})`;
}

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
      {levels.map((level, index) => (
        <span key={level.id} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-sm"
            style={{ backgroundColor: levelColor(index) }}
          />
          {level.label ?? level.code} {level.name}
        </span>
      ))}
    </div>
  );
}
