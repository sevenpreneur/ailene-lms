"use client";
import { getAilMemberMock } from "@/mock-data/shared";
import Image from "next/image";

export type LevelLabelStudentVariantAILN = "compact" | "summary";

export default function LevelLabelStudentAILN({
  variant = "compact",
  className,
}: {
  variant?: LevelLabelStudentVariantAILN;
  className?: string;
}) {
  const member = getAilMemberMock();

  const levelNumber = member.current_level.level_number;
  const levelName = member.current_level.name;
  const icon = member.current_level.icon;
  const label = `Level ${levelNumber}`;
  const imageAlt = levelName ?? label;

  if (variant === "summary") {
    return (
      <div
        className={`flex h-[60px] items-center gap-2 rounded-lg border bg-white px-3 dark:border-claude/30 dark:bg-claude/5 ${className ?? ""}`}
      >
        {icon && (
          <Image
            src={icon}
            alt={imageAlt}
            width={32}
            height={32}
            className="h-8 w-8"
          />
        )}
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Level Sekarang
          </div>
          <div className="font-bold dark:text-white">{label}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-9 items-center gap-2 rounded-full border border-dashboard-border bg-white px-3 dark:border-claude/30 dark:bg-claude/5 ${className ?? ""}`}
    >
      {icon && (
        <Image
          src={icon}
          alt={imageAlt}
          width={24}
          height={24}
          className="h-5 w-5"
        />
      )}
      <div className="text-sm font-semibold dark:text-white">{label}</div>
    </div>
  );
}
