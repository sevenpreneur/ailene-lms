"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

export type TabItem<T extends string | number> = {
  value: T;
  label: string;
  icon?: ReactNode;
  badge?: number | string | null;
  disabled?: boolean;
};

export default function Tabs<T extends string | number>({
  items,
  value,
  onValueChange,
  ariaLabel,
  stretch = false,
  compact = false,
}: {
  items: readonly TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  ariaLabel: string;
  stretch?: boolean;
  compact?: boolean;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    const enabled = items
      .map((item, i) => (!item.disabled ? i : -1))
      .filter((i) => i >= 0);
    if (enabled.length === 0) return;

    const current = enabled.indexOf(index);
    const next =
      event.key === "Home"
        ? enabled[0]
        : event.key === "End"
          ? enabled[enabled.length - 1]
          : enabled[
              (current +
                (event.key === "ArrowRight" ? 1 : -1) +
                enabled.length) %
                enabled.length
            ];
    onValueChange(items[next].value);
    buttons.current[next]?.focus();
  };

  return (
    <div
      className={`max-w-full overflow-x-auto pb-1 ${stretch ? "w-full" : ""}`}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`inline-flex min-w-max items-center gap-0.5 rounded-lg border border-dashboard-border bg-card-1 p-0.5 dark:bg-dashboard-bg ${stretch ? "w-full" : ""}`}
      >
        {items.map((item, index) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active && !item.disabled ? 0 : -1}
              disabled={item.disabled}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "h-[30px] px-3 text-xs" : "h-9 px-3.5 text-sm"} ${stretch ? "flex-1" : ""} ${active ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-card-2 dark:hover:text-white"}`}
            >
              {item.icon && (
                <span className="shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="whitespace-nowrap">{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200"}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
