"use client";
import { AILENE_ORG_NAME, AILENE_PROGRAM_NAME } from "@/lib/ailene-config";
import {
  usePdfReport,
  type ReportProps,
} from "@/components/pdf/AileneReportPDF";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import RoiProductivityBannerAILN from "@/components/banners/RoiProductivityBannerAILN";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import RoiOutcomeChartsAILN from "@/components/charts/RoiOutcomeChartsAILN";
import RoiDepartmentTableAILN from "@/components/indexes/RoiDepartmentTableAILN";
import TopPerformersTableAILN from "@/components/indexes/TopPerformersTableAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import KpiCaptionAILN from "@/components/labels/KpiCaptionAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import {
  EmptyHintAILN,
  SkeletonBlockAILN,
} from "@/components/states/DataStatesAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import {
  formatCompactIdr,
  formatDecimal,
  formatInt,
  formatScore,
} from "@/lib/ailene-format";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import { BadgeCheck, Clock, Coins, Download, Gauge } from "lucide-react";
import { useEffect } from "react";

function idrShort(value: number): string {
  const compact = formatCompactIdr(value);
  return compact.suffix
    ? `Rp ${compact.value} ${compact.suffix}`
    : `Rp ${compact.value}`;
}

export default function DashboardOutcomeAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const pdf = usePdfReport();
  const overviewQ = trpc.read.outcome.overview.useQuery();
  const performersQ = trpc.read.outcome.topPerformers.useQuery();
  const departmentRoiQ = trpc.read.outcome.departmentRoi.useQuery();

  const overview = overviewQ.data;
  const roi = formatCompactIdr(overview?.roi_total ?? 0);

  const buildReport = (): ReportProps => {
    const sections: ReportProps["sections"] = [];
    if (overview) {
      sections.push({
        type: "kpi",
        title: "ROI & Produktivitas",
        items: [
          {
            label: "Jam Dihemat Kumulatif",
            value: formatDecimal(overview.hours_saved_total),
            unit: "jam",
            footer: `≈ ${formatScore(overview.fte_equivalent)} FTE setahun`,
          },
          {
            label: "ROI Estimasi",
            value: `Rp ${roi.value}`,
            unit: roi.suffix,
            footer: `basis Rp${formatInt(overview.roi_rate_per_hour)}/jam`,
          },
          {
            label: "Avg Level Saat Ini",
            value: formatScore(overview.avg_level),
            unit: `/ ${overview.max_level_number}`,
            footer: `skala L0-L${overview.max_level_number}`,
          },
          {
            label: "Karyawan Tersertifikasi",
            value: formatInt(overview.certified_count),
            unit: `/ ${overview.member_count}`,
            footer: `${overview.certified_percent}% selesai >= L1`,
          },
        ],
      });
    }

    const departments = departmentRoiQ.data?.departments ?? [];
    if (departments.length > 0) {
      sections.push({
        type: "table",
        title: "Rincian ROI per Departemen",
        columns: ["Departemen", "Jumlah", "Jam/mg", "Rp/tahun", "Kontribusi"],
        align: ["left", "right", "right", "right", "right"],
        rows: departments.map((d) => [
          d.name,
          formatInt(d.member_count),
          formatDecimal(d.hours_saved_weekly),
          idrShort(d.roi_annualized),
          `${d.contribution_percent}%`,
        ]),
      });
    }

    const performers = performersQ.data?.list ?? [];
    if (performers.length > 0) {
      sections.push({
        type: "table",
        title: "Top Performers Org-Wide",
        columns: [
          "#",
          "Karyawan",
          "Departemen",
          "Level",
          "Skor",
          "Use case",
          "Jam",
        ],
        align: ["right", "left", "left", "left", "right", "right", "right"],
        rows: performers.map((p) => [
          p.rank,
          p.full_name,
          p.department,
          p.level_code,
          p.composite,
          formatInt(p.use_case_count),
          formatScore(p.hours),
        ]),
      });
    }

    return {
      org: AILENE_ORG_NAME || undefined,
      program: AILENE_PROGRAM_NAME,
      title: "ROI & Produktivitas",
      subtitle: overview
        ? `${formatInt(overview.member_count)} karyawan · ${overview.department_count} departemen`
        : undefined,
      generatedAt: dayjs().format("D MMMM YYYY"),
      sections,
    };
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="ROI & Produktivitas"
          desc={`${AILENE_PROGRAM_NAME} · ${
            overview
              ? `${formatInt(overview.member_count)} karyawan · ${overview.department_count} departemen`
              : "— karyawan · — departemen"
          }`}
        >
          <ButtonAILN
            variant="light"
            size="medium"
            onClick={() => pdf.generate(buildReport(), "roi-produktivitas.pdf")}
            disabled={pdf.exporting || !overview}
          >
            <Download className="size-4" />
            {pdf.exporting ? "Menyiapkan…" : "Export PDF"}
          </ButtonAILN>
        </PageHeaderAILN>

        <RoiProductivityBannerAILN />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Jam Dihemat Kumulatif",
              icon: Clock,
              accent: {
                tile: "bg-emerald-50 dark:bg-emerald-500/15",
                icon: "text-emerald-600 dark:text-emerald-300",
              },
              value: overview ? formatDecimal(overview.hours_saved_total) : "—",
              unit: "jam",
              footer: (
                <KpiCaptionAILN>
                  {overview
                    ? `≈ ${formatScore(overview.fte_equivalent)} FTE setahun`
                    : "—"}
                </KpiCaptionAILN>
              ),
            },
            {
              title: "ROI Estimasi",
              icon: Coins,
              accent: {
                tile: "bg-stakeholder-sponsor-soft",
                icon: "text-stakeholder-sponsor",
              },
              value: overview ? `Rp ${roi.value}` : "—",
              unit: roi.suffix,
              footer: (
                <KpiCaptionAILN>
                  {overview
                    ? `basis Rp${formatInt(overview.roi_rate_per_hour)}/jam dihemat`
                    : "—"}
                </KpiCaptionAILN>
              ),
            },
            {
              title: "Avg Level Saat Ini",
              icon: Gauge,
              accent: {
                tile: "bg-indigo-50 dark:bg-indigo-500/15",
                icon: "text-indigo-600 dark:text-indigo-300",
              },
              value: overview ? formatScore(overview.avg_level) : "—",
              unit: overview ? `/ ${overview.max_level_number}` : "/ —",
              footer: (
                <KpiCaptionAILN>
                  {overview ? `skala L0-L${overview.max_level_number}` : "—"}
                </KpiCaptionAILN>
              ),
            },
            {
              title: "Karyawan Tersertifikasi",
              icon: BadgeCheck,
              accent: {
                tile: "bg-cyan-50 dark:bg-cyan-500/15",
                icon: "text-cyan-600 dark:text-cyan-300",
              },
              value: overview ? formatInt(overview.certified_count) : "—",
              unit: overview ? `/ ${overview.member_count}` : "/ —",
              footer: (
                <KpiCaptionAILN>
                  {overview
                    ? `${overview.certified_percent}% selesai >= L1`
                    : "—"}
                </KpiCaptionAILN>
              ),
            },
          ].map((kpi, i) => (
            <ScorecardAILN
              key={i}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              icon={kpi.icon}
              accent={kpi.accent}
            >
              {kpi.footer}
            </ScorecardAILN>
          ))}
        </div>

        <RoiOutcomeChartsAILN />

        <RoiDepartmentTableAILN />
      </div>
    </PageContainerAILN>
  );
}
