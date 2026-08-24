"use client";
import ReadinessDistributionAILN from "@/components/charts/ReadinessDistributionAILN";
import BaselineByDepartmentAILN from "@/components/indexes/BaselineByDepartmentAILN";
import PillarRankingAILN from "@/components/indexes/PillarRankingAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";

export default function PreAssessmentSponsorAILN() {
  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Baseline kompetensi seluruh organisasi"
          desc="Hasil pre-assessment awal tiap departemen di 6 pillar kompetensi AI"
        />

        {/* Department × pillar baseline matrix — full width */}
        <BaselineByDepartmentAILN />

        {/* Pillar ranking + readiness distribution side by side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PillarRankingAILN />
          <ReadinessDistributionAILN />
        </div>
      </div>
    </PageContainerAILN>
  );
}
