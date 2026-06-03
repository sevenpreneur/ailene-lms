import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface ScorecardStripItem {
  title: string;
  value: string | number;
  unit?: string;
  /** Small supporting line under the value. */
  footer?: ReactNode;
  icon?: LucideIcon;
  /** Optional colored icon tile (tile bg + icon color classes). When omitted,
   *  the icon falls back to a neutral bordered circle. */
  accent?: { tile: string; icon: string };
}

/**
 * KPI row in the statistics-02 cell style (title, value, footer + circular icon)
 * but rendered as separate cards in a responsive grid. Real data + preset tokens.
 */
export default function ScorecardStripAILN({
  items,
}: {
  items: ScorecardStripItem[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="ailn-card">
            <div className="flex items-start justify-between gap-3 p-6">
              <div className="flex min-w-0 flex-col gap-4">
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <div>
                  <p className="flex items-baseline gap-1.5">
                    <span className="font-geist-mono text-3xl font-bold leading-none tracking-tight text-foreground">
                      {item.value}
                    </span>
                    {item.unit && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.unit}
                      </span>
                    )}
                  </p>
                  {item.footer && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {item.footer}
                    </p>
                  )}
                </div>
              </div>
              {Icon &&
                (item.accent ? (
                  <div
                    className={`shrink-0 rounded-full p-3 ${item.accent.tile}`}
                  >
                    <Icon size={16} className={item.accent.icon} />
                  </div>
                ) : (
                  <div className="shrink-0 rounded-full border border-border p-3">
                    <Icon size={16} />
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
