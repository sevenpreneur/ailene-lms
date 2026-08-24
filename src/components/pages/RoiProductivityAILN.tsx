"use client";
import RoiProductivityBannerAILN from "@/components/banners/RoiProductivityBannerAILN";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import RoiOutcomeChartsAILN from "@/components/charts/RoiOutcomeChartsAILN";
import RoiDepartmentTableAILN from "@/components/indexes/RoiDepartmentTableAILN";
import KpiCaptionAILN from "@/components/labels/KpiCaptionAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import {
  usePdfReport,
  type ReportProps,
} from "@/components/pdf/AileneReportPDF";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { ORG_NAME, PROGRAM_NAME } from "@/lib/config";
import {
  formatCompactIdr,
  formatDecimal,
  formatInt,
  formatScore,
} from "@/lib/format";
import {
  getDepartmentRoiMock,
  getOutcomeOverviewMock,
  getTopPerformersMock,
} from "@/mock-data/sponsor";
import dayjs from "dayjs";
import { BadgeCheck, Clock, Coins, Download, Gauge } from "lucide-react";

function idrShort(value: number): string {
  const compact = formatCompactIdr(value);
  return compact.suffix
    ? `Rp ${compact.value} ${compact.suffix}`
    : `Rp ${compact.value}`;
}

export default function RoiProductivityAILN() {
  const pdf = usePdfReport();
  const overview = getOutcomeOverviewMock();
  const roi = formatCompactIdr(overview.roi_total);

  const buildReport = (): ReportProps => {
    const sections: ReportProps["sections"] = [];
    sections.push({
      type: "kpi",
      title: "ROI Productivity",
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

    const departments = getDepartmentRoiMock().departments;
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

    const performers = getTopPerformersMock().list;
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
      org: ORG_NAME || undefined,
      program: PROGRAM_NAME,
      title: "ROI Productivity",
      subtitle: `${formatInt(overview.member_count)} karyawan · ${overview.department_count} departemen`,
      generatedAt: dayjs().format("D MMMM YYYY"),
      sections,
    };
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="ROI Productivity"
          desc={`${PROGRAM_NAME} · ${formatInt(overview.member_count)} karyawan · ${overview.department_count} departemen`}
        >
          <ButtonAILN
            variant="light"
            size="medium"
            onClick={() => pdf.generate(buildReport(), "roi-productivity.pdf")}
            disabled={pdf.exporting}
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
              value: formatDecimal(overview.hours_saved_total),
              unit: "jam",
              footer: (
                <KpiCaptionAILN>
                  ≈ {formatScore(overview.fte_equivalent)} FTE setahun
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
              value: `Rp ${roi.value}`,
              unit: roi.suffix,
              footer: (
                <KpiCaptionAILN>
                  basis Rp{formatInt(overview.roi_rate_per_hour)}/jam dihemat
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
              value: formatScore(overview.avg_level),
              unit: `/ ${overview.max_level_number}`,
              footer: (
                <KpiCaptionAILN>
                  skala L0-L{overview.max_level_number}
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
              value: formatInt(overview.certified_count),
              unit: `/ ${overview.member_count}`,
              footer: (
                <KpiCaptionAILN>
                  {overview.certified_percent}% selesai &gt;= L1
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
