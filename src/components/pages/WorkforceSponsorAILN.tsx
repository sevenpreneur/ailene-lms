"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import LevelCompositionSponsorAILN from "@/components/charts/LevelCompositionSponsorAILN";
import LevelDistributionSponsorAILN from "@/components/charts/LevelDistributionSponsorAILN";
import WorkforceLevelByDeptAILN from "@/components/charts/WorkforceLevelByDeptAILN";
import WorkforceMembersAILN from "@/components/indexes/WorkforceMembersAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import SkeletonLevelDistributionAILN from "@/components/states/SkeletonLevelDistributionAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { AILENE_ORG_NAME, AILENE_PROGRAM_NAME } from "@/lib/ailene-config";
import {
  usePdfReport,
  type ReportProps,
} from "@/components/pdf/AileneReportPDF";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import { Download } from "lucide-react";
import { useEffect } from "react";

const BRAND_GREEN = "#1f5f4e"; // active / participating

export default function WorkforceSponsorAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const pdf = usePdfReport();
  const q = trpc.read.levelDistribution.useQuery();

  if (q.isLoading) {
    return (
      <PageContainerAILN>
        <SkeletonLevelDistributionAILN />
      </PageContainerAILN>
    );
  }

  if (q.error || !q.data) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const data = q.data;
  const levelNameByCode = new Map(data.levels.map((l) => [l.code, l.name]));

  // Report exports the full org snapshot.
  const buildReport = (): ReportProps => ({
    org: AILENE_ORG_NAME || undefined,
    program: AILENE_PROGRAM_NAME,
    title: "Distribusi Level Organisasi",
    subtitle: `${data.total.toLocaleString("id-ID")} karyawan · ${data.groups.length} departemen · partisipasi ${data.participation_percent}%`,
    generatedAt: dayjs().format("D MMMM YYYY"),
    sections: [
      {
        type: "donut",
        title: "Tingkat Partisipasi",
        centerValue: `${data.participation_percent}%`,
        centerLabel: "aktif",
        segments: [
          { label: "Aktif", value: data.active_weekly, color: BRAND_GREEN },
          {
            label: "Belum aktif",
            value: Math.max(data.total - data.active_weekly, 0),
            color: "#cbd5e1",
          },
        ],
      },
      ...(data.levels.length > 0
        ? [
            {
              type: "bar" as const,
              title: "Distribusi Level Organisasi",
              items: data.levels.map((l) => ({
                label: `${l.code} · ${l.name}`,
                value: l.count,
                display: `${l.count} (${l.percent}%)`,
              })),
            },
          ]
        : []),
      {
        type: "table",
        title: "Distribusi Level per Departemen",
        columns: ["Departemen", ...data.levels.map((l) => l.code), "Total"],
        align: ["left", ...data.levels.map(() => "right" as const), "right"],
        rows: data.groups.map((g) => [
          g.name,
          ...g.levels.map((l) => l.count),
          g.total,
        ]),
      },
      ...(data.groups_needing_intervention.length > 0
        ? [
            {
              type: "table" as const,
              title: "Departemen Perlu Intervensi",
              columns: ["Departemen", "L0–L1", "Total", "% Pemula"],
              align: ["left", "right", "right", "right"] as (
                | "left"
                | "right"
              )[],
              rows: data.groups_needing_intervention.map((g) => [
                g.name,
                g.entry_level_count,
                g.total,
                `${g.entry_level_percent}%`,
              ]),
            },
          ]
        : []),
    ],
  });

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <PageHeaderAILN
          title="Distribusi Level Organisasi"
          desc="Snapshot level karyawan aktif berdasarkan departemen."
        >
          <ButtonAILN
            variant="light"
            size="medium"
            onClick={() => pdf.generate(buildReport(), "distribusi-level.pdf")}
            disabled={pdf.exporting}
          >
            <Download className="size-4" />
            {pdf.exporting ? "Menyiapkan…" : "Export PDF"}
          </ButtonAILN>
        </PageHeaderAILN>

        {/* Distribusi per departemen (kiri, lebih lebar) + Komposisi Level (kanan) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <WorkforceLevelByDeptAILN
            groups={data.groups}
            levels={data.levels}
            levelNameByCode={levelNameByCode}
          />
          <LevelCompositionSponsorAILN levels={data.levels} />
        </div>

        <LevelDistributionSponsorAILN showDetailLink={false} />

        <WorkforceMembersAILN />
      </div>
    </PageContainerAILN>
  );
}
