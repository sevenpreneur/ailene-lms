import {
  ShareBarListContent,
  ShareBarListFill,
  ShareBarListItem,
  ShareBarListLabel,
  ShareBarListValue,
} from "@/components/share-bar-list";
import React from "react";

// Share-bar colors by row meaning: highlight (routine/positive), neutral, warn.
const BAR_TONE: Record<"highlight" | "neutral" | "warn", string> = {
  highlight: "#1f5f4e", // brand deep green
  neutral: "#64748b", // slate
  warn: "#f59e0b", // amber — risk lens
};

/**
 * Efferd ShareBarList row: label overlaid on a length-proportional bar, value
 * pinned right, single color per tone. Used by the pre-assessment share bars
 * (usage frequency, tools, maturity, safety gaps, use cases).
 */
export default function ShareBarRowAILN({
  leading,
  label,
  percent,
  tone = "neutral",
}: {
  leading?: React.ReactNode;
  label: string;
  percent: number;
  tone?: "highlight" | "neutral" | "warn";
}) {
  return (
    <ShareBarListItem
      value={percent}
      title={label}
      style={{ "--share-bar-color": BAR_TONE[tone] } as React.CSSProperties}
    >
      <ShareBarListContent>
        <span className="flex min-w-0 items-center gap-2">
          {leading}
          <ShareBarListLabel className="truncate text-gray-700 dark:text-gray-200">
            {label}
          </ShareBarListLabel>
        </span>
        <ShareBarListValue className="shrink-0 text-gray-900 dark:text-white">
          {percent}%
        </ShareBarListValue>
      </ShareBarListContent>
      <ShareBarListFill />
    </ShareBarListItem>
  );
}
