"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { Star, Trophy } from "lucide-react";

interface AchievementsCardAILNProps {
  totalXp: number;
  currentLevelNumber: number | null;
  currentLevelName: string | null;
  toolsMastered: string[];
  className?: string;
}

const fmtCount = (n: number) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function AchievementsCardAILN({
  totalXp,
  currentLevelNumber,
  currentLevelName,
  toolsMastered,
  className,
}: AchievementsCardAILNProps) {
  return (
    <SectionContainerAILN
      title="Capaian Kamu"
      desc="Ringkasan level dan XP kamu sejauh ini."
      className={className}
      contentClassName="flex flex-col"
    >
      {/* Level + XP hero */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-dashboard-border bg-gradient-to-br from-hijau-t via-white to-hijau-t/40 p-4 dark:border-claude/20 dark:from-claude/10 dark:via-card-1 dark:to-claude/5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lime-bright shadow-[0_0_0_3px_rgba(255,255,255,0.6)] dark:shadow-[0_0_0_3px_rgba(0,0,0,0.3)]">
            <Trophy className="size-5 text-forest-deep" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Level Sekarang
            </div>
            <div className="truncate text-base font-medium text-foreground dark:text-white">
              {currentLevelNumber != null
                ? `Level ${currentLevelNumber}${currentLevelName ? ` · ${currentLevelName}` : ""}`
                : "Belum ada level"}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-headline flex items-center justify-end gap-1.5 text-2xl font-medium text-amber-500 dark:text-amber-400">
            <Star className="size-5 fill-current" />
            {fmtCount(totalXp)}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Total XP
          </div>
        </div>
      </div>

      {toolsMastered.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Telah Menguasai Tools
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {toolsMastered.map((t) => (
              <span
                key={t}
                className="rounded-full border border-dashboard-border bg-white px-2.5 py-1 text-xs text-foreground dark:bg-card-2 dark:text-gray-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </SectionContainerAILN>
  );
}
