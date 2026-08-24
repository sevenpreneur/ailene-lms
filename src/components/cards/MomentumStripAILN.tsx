"use client";

import { useProjectId } from "@/lib/use-project-id";
import { trpc } from "@/trpc/client";
import { Flame, Target } from "lucide-react";
import Link from "next/link";

export default function MomentumStripAILN() {
  const projectId = useProjectId();
  const streakQ = trpc.read.streak.useQuery();
  const compQ = trpc.read.competencyProfile.useQuery();

  const streak = streakQ.data?.current_streak ?? 0;
  const dims = compQ.data?.profile?.dimensions ?? [];
  const weakest = dims.length
    ? dims.reduce((min, d) => (d.score < min.score ? d : min), dims[0])
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-4 rounded-lg border border-dashboard-border bg-[#FCFCFD] p-5 dark:bg-card-1">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400">
          <Flame className="size-6" fill="currentColor" />
        </span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className=" text-3xl font-bold leading-none text-foreground dark:text-white">
              {streak}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              hari berjalan
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {streak > 0
              ? "Mantap! Selesaikan 1 aktivitas hari ini biar streak nggak putus."
              : "Mulai streak-mu - selesaikan 1 aktivitas hari ini."}
          </p>
        </div>
      </div>

      <Link
        href={`/${projectId}/student/skill-practice`}
        className="group flex flex-col justify-center gap-1 rounded-lg border border-dashboard-border bg-[#FCFCFD] p-5 transition hover:border-red-300 dark:bg-card-1 dark:hover:border-red-500/40"
      >
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          <Target className="size-3.5" />
          Fokus hari ini
        </div>
        {weakest ? (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Perkuat{" "}
              <span className="font-semibold text-foreground dark:text-white">
                {weakest.name}
              </span>{" "}
              <span className="text-gray-400 dark:text-gray-500">
                ({weakest.score}/5)
              </span>
            </p>
            <span className="text-xs font-medium text-red-600 group-hover:underline dark:text-red-400">
              Latihan sekarang -&gt;
            </span>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selesaikan beberapa aktivitas dulu untuk dapat rekomendasi fokus.
          </p>
        )}
      </Link>
    </div>
  );
}
