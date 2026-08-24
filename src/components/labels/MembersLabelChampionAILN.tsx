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
      className={`inline-flex h-9 items-center gap-2 rounded-full border border-hijau-t bg-hijau-t px-3 text-sm font-semibold text-claude dark:border-claude/30 dark:bg-claude/10 dark:text-lime-bright ${className ?? ""}`}
    >
      <Users className="size-4" />
      <span className="font-bold">{count}</span>
      <span className="font-medium">members led</span>
    </span>
  );
}
