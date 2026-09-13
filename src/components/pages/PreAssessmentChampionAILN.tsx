"use client";
import ReadinessDistributionChampionAILN from "@/components/charts/ReadinessDistributionChampionAILN";
import BaselineByMemberChampionAILN from "@/components/indexes/BaselineByMemberChampionAILN";
import PillarRankingChampionAILN from "@/components/indexes/PillarRankingChampionAILN";
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
          desc="Hasil pre-assessment tiap anggota di departemen Anda — 6 pillar kompetensi AI"
        />

        {/* Member × pillar baseline matrix — full width */}
        <BaselineByMemberChampionAILN data={data} />

        {/* Coaching priority ranking + readiness distribution side by side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PillarRankingChampionAILN data={data} />
          <ReadinessDistributionChampionAILN data={data} />
        </div>
      </div>
    </PageContainerAILN>
  );
}
