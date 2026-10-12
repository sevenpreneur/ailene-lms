"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { EmptyHintAILN } from "@/components/states/DataStatesAILN";
import { formatScore } from "@/lib/format";
import { scoreTone } from "@/lib/pre-assessment";
import type { PreAssessmentBaselineCluster } from "@/apis/pre-assessment";

const TONE_BAR = {
  high: "bg-emerald-600",
  mid: "bg-amber-500",
  low: "bg-red-500",
};

// Cluster averages, already sorted weakest-first by the API — the coaching priority order.
export default function ClusterRankingAILN({
  title,
  desc,
  clusters,
}: {
  title: string;
  desc: string;
  clusters: PreAssessmentBaselineCluster[];
}) {
  const measured = clusters.filter(
    (c): c is PreAssessmentBaselineCluster & { score: number } =>
      c.score !== null,
  );

  return (
    <SectionContainerAILN title={title} desc={desc}>
      {measured.length === 0 ? (
        <EmptyHintAILN className="h-40">Belum ada data.</EmptyHintAILN>
      ) : (
        <div className="flex flex-col gap-4">
          {measured.map((c, i) => (
            <div key={c.code} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span className="text-gray-400 dark:text-gray-500">
                    {i + 1}.
                  </span>{" "}
                  {c.name}
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                  {formatScore(c.score)} / 100
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
                <div
                  className={`h-full rounded-full ${TONE_BAR[scoreTone(c.score)]}`}
                  style={{ width: `${Math.max(Math.min(c.score, 100), c.score > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionContainerAILN>
  );
}
