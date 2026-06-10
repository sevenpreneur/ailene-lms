import { Star } from "lucide-react";

// Minimal team-score banner for the champion dashboard. Headline is a 0–5
// composite score (size-independent, comparable across groups). One subtitle.
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
    <section className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 dark:border-emerald-500/25 dark:from-emerald-500/10 dark:to-transparent">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
        <Star className="size-3.5 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />
        Tim Saya · {groupName}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Skor Tim:
        </span>
        <span className="text-4xl font-bold leading-none tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-5xl">
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
