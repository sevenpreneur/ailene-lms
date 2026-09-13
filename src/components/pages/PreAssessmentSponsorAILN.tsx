"use client";
import ReadinessDistributionAILN from "@/components/charts/ReadinessDistributionAILN";
import BaselineByDepartmentAILN from "@/components/indexes/BaselineByDepartmentAILN";
import PillarRankingAILN from "@/components/indexes/PillarRankingAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { PreAssessmentOrganization } from "@/apis/sponsor";

export default function PreAssessmentSponsorAILN({
  data,
}: {
  data: PreAssessmentOrganization | null;
}) {
  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Baseline kompetensi seluruh organisasi"
          desc="Hasil pre-assessment awal tiap departemen di 6 pillar kompetensi AI"
        />

        {/* Department × pillar baseline matrix — full width */}
        <BaselineByDepartmentAILN data={data} />

        {/* Pillar ranking + readiness distribution side by side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PillarRankingAILN data={data} />
          <ReadinessDistributionAILN data={data} />
        </div>
      </div>
    </PageContainerAILN>
  );
}
