"use client";
import { Users } from "lucide-react";

export default function MembersLabelChampionAILN({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-9 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 ${className ?? ""}`}
    >
      <Users className="size-4" />
      <span className="font-bold">{count}</span>
      <span className="font-medium">members led</span>
    </span>
  );
}
