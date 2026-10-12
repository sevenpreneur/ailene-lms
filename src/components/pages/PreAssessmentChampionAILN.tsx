"use client";
import BandDistributionAILN from "@/components/charts/BandDistributionAILN";
import BaselineByMemberChampionAILN from "@/components/indexes/BaselineByMemberChampionAILN";
import ClusterRankingAILN from "@/components/indexes/ClusterRankingAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { PreAssessmentTeam } from "@/apis/champion";

export default function PreAssessmentChampionAILN({
  data,
}: {
  data: PreAssessmentTeam | null;
}) {
  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Baseline kompetensi tim"
          desc="Hasil pre-assessment tiap anggota di departemen Anda: band AI Proficiency dan skor per area kompetensi"
        />

        <BaselineByMemberChampionAILN data={data} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ClusterRankingAILN
            title="Prioritas Coaching per Area"
            desc="Rata-rata skor tim · diurut dari skor terendah"
            clusters={data?.team_clusters ?? []}
          />
          {data && (
            <BandDistributionAILN
              title="Distribusi Band Anggota"
              unit="anggota"
              bands={data.bands}
              targetBand={data.target_band}
              meetsTargetCount={data.meets_target_count}
              scoredCount={data.scored_count}
            />
          )}
        </div>
      </div>
    </PageContainerAILN>
  );
}
