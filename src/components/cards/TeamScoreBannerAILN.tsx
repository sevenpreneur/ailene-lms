"use client";
import { Star } from "lucide-react";

// Champion team-score banner; no trend sparkline because the backend exposes no team-score history.
export default function TeamScoreBannerAILN({
  groupName,
  score,
  maxScore,
  level2Plus,
  totalMembers,
}: {
  groupName: string;
  score: number;
  maxScore: number;
  level2Plus: number;
  totalMembers: number;
}) {
  const fmt = (n: number) => n.toFixed(1).replace(".", ",");

  return (
    <section className="overflow-hidden rounded-2xl border border-hijau-t bg-gradient-to-br from-hijau-t to-white p-6 dark:border-claude/25 dark:from-claude/10 dark:to-transparent">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-claude dark:text-lime-bright">
        <Star className="size-3.5 fill-claude text-claude dark:fill-lime-bright dark:text-lime-bright" />
        Tim Saya · {groupName}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Skor Tim:
        </span>
        <span className="text-4xl font-bold leading-none tracking-tight text-claude dark:text-lime-bright sm:text-5xl">
          {fmt(score)}
        </span>
        <span className="text-2xl font-semibold text-gray-400 dark:text-gray-500">
          /{fmt(maxScore)}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {totalMembers > 0 ? (
          <>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {level2Plus} dari {totalMembers}
            </span>{" "}
            anggota sudah mencapai Level 2 ke atas
          </>
        ) : (
          "Belum ada anggota di tim ini"
        )}
      </p>
    </section>
  );
}
