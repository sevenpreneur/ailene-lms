"use client";
import BandDistributionAILN from "@/components/charts/BandDistributionAILN";
import BaselineByDepartmentAILN from "@/components/indexes/BaselineByDepartmentAILN";
import ClusterRankingAILN from "@/components/indexes/ClusterRankingAILN";
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
          desc="Hasil pre-assessment awal tiap departemen: band AI Proficiency dan skor per area kompetensi"
        />

        <BaselineByDepartmentAILN data={data} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ClusterRankingAILN
            title="Prioritas per Area Kompetensi"
            desc="Rata-rata skor seluruh karyawan · diurut dari skor terendah"
            clusters={data?.org_clusters ?? []}
          />
          {data && (
            <BandDistributionAILN
              title="Distribusi Band Karyawan"
              unit="karyawan"
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
