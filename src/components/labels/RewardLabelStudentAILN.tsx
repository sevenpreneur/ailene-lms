"use client";
import { getAilMemberMock } from "@/mock-data/shared";
import { Star } from "lucide-react";

type RewardLabelStudentVariantAILN = "compact" | "summary";

export default function RewardLabelStudentAILN({
  variant = "compact",
  className,
}: {
  variant?: RewardLabelStudentVariantAILN;
  className?: string;
}) {
  const member = getAilMemberMock();

  const formattedXp = member.total_xp.toLocaleString();

  if (variant === "summary") {
    return (
      <div
        className={`flex h-[60px] items-center gap-2 rounded-lg border bg-white px-3 dark:border-claude/30 dark:bg-claude/5 ${className ?? ""}`}
      >
        <Star
          className="size-4 text-amber-500 dark:text-amber-400"
          fill="currentColor"
        />
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 dark:text-gray-400">Reward</div>
          <div className="font-bold dark:text-white">{formattedXp} XP</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-9 items-center gap-2 rounded-full border border-dashboard-border bg-white px-3 dark:border-claude/30 dark:bg-claude/5 ${className ?? ""}`}
    >
      <Star
        className="size-4 text-amber-500 dark:text-amber-400"
        fill="currentColor"
      />
      <div className="text-sm font-semibold dark:text-white">
        {formattedXp} XP
      </div>
    </div>
  );
}
