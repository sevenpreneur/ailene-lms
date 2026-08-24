"use client";
import type { LucideIcon } from "lucide-react";

export default function SponsorStatLabelAILN({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-9 items-center gap-2 rounded-full border border-stakeholder-sponsor/20 bg-stakeholder-sponsor-soft px-3 text-sm font-semibold text-stakeholder-sponsor dark:border-claude/30 dark:bg-claude/10 dark:text-lime-bright ${className ?? ""}`}
    >
      <Icon className="size-4" />
      <span className="font-bold">{value}</span>
      <span className="font-medium">{label}</span>
    </span>
  );
}
