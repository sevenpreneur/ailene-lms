"use client";
import { trpc } from "@/trpc/client";
import Image from "next/image";

export type LevelLabelStudentVariantAILN = "compact" | "summary";

export default function LevelLabelStudentAILN({
  variant = "compact",
  className,
}: {
  variant?: LevelLabelStudentVariantAILN;
  className?: string;
}) {
  const memberQ = trpc.auth.checkAilMember.useQuery();
  const member = memberQ.data?.ail_member;

  if (!member) return null;

  const levelNumber = member.current_level?.level_number ?? 0;
  const levelName = member.current_level?.name;
  const icon = member.current_level?.icon;
  const label = `Level ${levelNumber}`;
  const imageAlt = levelName ?? label;

  if (variant === "summary") {
    return (
      <div
        className={`flex h-[60px] items-center gap-2 rounded-lg border bg-white px-3 dark:border-red-500/30 dark:bg-red-500/5 ${className ?? ""}`}
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
      className={`flex h-9 items-center gap-2 rounded-full border border-dashboard-border bg-white px-3 dark:border-red-500/30 dark:bg-red-500/5 ${className ?? ""}`}
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
