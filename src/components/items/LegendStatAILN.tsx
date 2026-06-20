import { formatInt } from "@/lib/format";

/**
 * One colored-square + label + right-aligned count row used in the Sponsor
 * donut legends (participation, outcome target). Shared so the level
 * distribution and outcome dashboards render legend entries identically.
 */
export default function LegendStatAILN({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-2.5 shrink-0 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-muted-foreground dark:text-gray-200">
        {label}
      </span>
      <span className="ml-auto text-sm font-bold text-foreground">
        {formatInt(value)}
      </span>
    </div>
  );
}
