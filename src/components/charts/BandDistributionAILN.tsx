"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { EmptyHintAILN } from "@/components/states/DataStatesAILN";
import { formatInt } from "@/lib/format";
import type {
  PreAssessmentBand,
  PreAssessmentBaselineBandCount,
} from "@/apis/pre-assessment";

// How many scored people sit in each CFTE band, highest band on top, target and above in green.
export default function BandDistributionAILN({
  title,
  unit,
  bands,
  targetBand,
  meetsTargetCount,
  scoredCount,
}: {
  title: string;
  unit: string;
  bands: PreAssessmentBaselineBandCount[];
  targetBand: PreAssessmentBand;
  meetsTargetCount: number;
  scoredCount: number;
}) {
  const max = Math.max(1, ...bands.map((b) => b.count));
  const pct =
    scoredCount === 0 ? 0 : Math.round((meetsTargetCount / scoredCount) * 100);

  return (
    <SectionContainerAILN
      title={title}
      desc={`Target program: band ${targetBand.band} (${targetBand.name})`}
    >
      {scoredCount === 0 ? (
        <EmptyHintAILN className="h-40">Belum ada data.</EmptyHintAILN>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium tabular-nums text-foreground">
              {pct}%
            </span>
            <span className="text-sm text-muted-foreground">
              {formatInt(meetsTargetCount)} dari {formatInt(scoredCount)} {unit}{" "}
              sudah mencapai target
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {[...bands].reverse().map((b) => {
              const reached = b.band >= targetBand.band;
              return (
                <div
                  key={b.band}
                  className="grid grid-cols-[minmax(0,10rem)_1fr_2rem] items-center gap-3"
                >
                  <span className="truncate text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium tabular-nums text-foreground">
                      B{b.band}
                    </span>{" "}
                    {b.name}
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
                    <div
                      className={`h-full rounded-full ${
                        reached ? "bg-emerald-600" : "bg-amber-500"
                      }`}
                      style={{
                        width: `${b.count === 0 ? 0 : Math.max((b.count / max) * 100, 4)}%`,
                      }}
                    />
                  </div>
                  <span className="text-right text-xs font-medium tabular-nums text-foreground">
                    {formatInt(b.count)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionContainerAILN>
  );
}
