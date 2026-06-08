import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface ScorecardAILNProps {
  title: string;
  value: string | number;
  unit?: string;
  prefix?: string;
  icon?: LucideIcon;
  accent?: { tile: string; icon: string };
  children?: ReactNode;
}

export default function ScorecardAILN({
  title,
  value,
  unit,
  prefix,
  icon: Icon,
  accent,
  children,
}: ScorecardAILNProps) {
  return (
    <div className="ailn-card flex flex-col overflow-hidden">
      <div className="flex flex-1 items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <div className="text-xs font-bold text-muted-foreground tracking-widest">
            {title.toUpperCase()}
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            {prefix && (
              <span className="text-lg font-semibold text-muted-foreground">
                {prefix}
              </span>
            )}
            <span className=" text-4xl font-bold leading-none tracking-tight text-foreground">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </div>

          {children && <div className="mt-3">{children}</div>}
        </div>

        {Icon &&
          (accent ? (
            <div className={`shrink-0 rounded-full p-3 ${accent.tile}`}>
              <Icon size={16} className={accent.icon} />
            </div>
          ) : (
            <div className="shrink-0 rounded-full border border-border p-3">
              <Icon size={16} />
            </div>
          ))}
      </div>
    </div>
  );
}
