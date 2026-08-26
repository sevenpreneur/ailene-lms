"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { Clock, Lightbulb, MessageSquare, Star, Trophy } from "lucide-react";

interface AchievementsCardAILNProps {
  totalXp: number;
  currentLevelNumber: number | null;
  currentLevelName: string | null;
  useCaseApprovedCount: number;
  promptApprovedCount: number;
  hoursSavedTotal: number;
  toolsMastered: string[];
  className?: string;
}

const fmtCount = (n: number) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: 0 });

const fmtHours = (n: number) =>
  n.toLocaleString("id-ID", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });

export default function AchievementsCardAILN({
  totalXp,
  currentLevelNumber,
  currentLevelName,
  useCaseApprovedCount,
  promptApprovedCount,
  hoursSavedTotal,
  toolsMastered,
  className,
}: AchievementsCardAILNProps) {
  return (
    <SectionContainerAILN
      title="Capaian Kamu"
      desc="Ringkasan level, XP, dan kontribusi kamu sejauh ini."
      className={className}
      contentClassName="flex flex-col"
    >
      {/* Level + XP hero */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashboard-border bg-gradient-to-br from-hijau-t via-white to-hijau-t/40 p-4 dark:border-claude/20 dark:from-claude/10 dark:via-card-1 dark:to-claude/5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lime-bright shadow-[0_0_0_3px_rgba(255,255,255,0.6)] dark:shadow-[0_0_0_3px_rgba(0,0,0,0.3)]">
            <Trophy className="size-5 text-forest-deep" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Level Sekarang
            </div>
            <div className="truncate text-base font-bold text-foreground dark:text-white">
              {currentLevelNumber != null
                ? `Level ${currentLevelNumber}${currentLevelName ? ` · ${currentLevelName}` : ""}`
                : "Belum ada level"}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1.5 text-2xl font-black text-amber-500 dark:text-amber-400">
            <Star className="size-5 fill-current" />
            {fmtCount(totalXp)}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Total XP
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <StatTile
          icon={Lightbulb}
          value={fmtCount(useCaseApprovedCount)}
          label="Use Case"
          color="blue"
        />
        <StatTile
          icon={MessageSquare}
          value={fmtCount(promptApprovedCount)}
          label="Prompt"
          color="violet"
        />
        <StatTile
          icon={Clock}
          value={fmtHours(hoursSavedTotal)}
          label="Jam Hemat"
          color="emerald"
        />
      </div>

      {toolsMastered.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
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

const TILE_COLORS = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
} as const;

function StatTile({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Lightbulb;
  value: string;
  label: string;
  color: keyof typeof TILE_COLORS;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashboard-border bg-white py-3 dark:bg-card-2">
      <div
        className={`flex size-8 items-center justify-center rounded-full ${TILE_COLORS[color]}`}
      >
        <Icon className="size-4" />
      </div>
      <div className="text-lg font-bold leading-none text-foreground dark:text-white">
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
