"use client";
import { AILENE_ORG_NAME, AILENE_PROGRAM_NAME } from "@/lib/ailene-config";
import {
  usePdfReport,
  type ReportProps,
} from "@/components/pdf/AileneReportPDF";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import {
  TARGET_LEVEL,
  targetLevelName,
} from "@/components/charts/outcome-target";
import ProcessAreaAILN from "@/components/charts/ProcessAreaAILN";
import ResultDonutAILN from "@/components/charts/ResultDonutAILN";
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
  const levelQ = trpc.read.outcome.levelDistribution.useQuery();
  const performersQ = trpc.read.outcome.topPerformers.useQuery();

  const overview = overviewQ.data;
  const roi = formatCompactIdr(overview?.roi_total ?? 0);

  const buildReport = (): ReportProps => {
    const sections: ReportProps["sections"] = [];
    if (overview) {
      sections.push({
        type: "kpi",
        title: "Hasil Akhir Program",
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
            footer: `skala L0–L${overview.max_level_number}`,
          },
          {
            label: "Karyawan Tersertifikasi",
            value: formatInt(overview.certified_count),
            unit: `/ ${overview.member_count}`,
            footer: `${overview.certified_percent}% selesai ≥ L1`,
          },
        ],
      });
    }
    const dist = levelQ.data?.distribution ?? [];
    const distTotal = dist.reduce((sum, d) => sum + d.count, 0) || 1;
    if (dist.length > 0) {
      const achieved = dist
        .filter((d) => d.level_number >= TARGET_LEVEL)
        .reduce((sum, d) => sum + d.count, 0);
      sections.push({
        type: "donut",
        title: `Hasil Akhir · Capai ≥ L${TARGET_LEVEL}`,
        centerValue: `${Math.round((achieved / distTotal) * 100)}%`,
        centerLabel: `≥ L${TARGET_LEVEL}`,
        segments: [
          {
            label: `Capai ≥ L${TARGET_LEVEL}`,
            value: achieved,
            color: "#1f5f4e",
          },
          {
            label: "Belum",
            value: Math.max(distTotal - achieved, 0),
            color: "#cbd5e1",
          },
        ],
      });
    }
    if (dist.length > 0) {
      sections.push({
        type: "table",
        title: "Distribusi Level Akhir",
        columns: ["Level", "Karyawan", "%"],
        align: ["left", "right", "right"],
        rows: dist.map((d) => [
          `L${d.level_number} · ${d.name}`,
          formatInt(d.count),
          `${Math.round((d.count / distTotal) * 100)}%`,
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
      title: "Outcome Report",
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
          title="Outcome Report"
          desc={`${AILENE_PROGRAM_NAME} · ${
            overview
              ? `${formatInt(overview.member_count)} karyawan · ${overview.department_count} departemen`
              : "— karyawan · — departemen"
          }`}
        >
          <ButtonAILN
            variant="light"
            size="medium"
            onClick={() => pdf.generate(buildReport(), "outcome-report.pdf")}
            disabled={pdf.exporting || !overview}
          >
            <Download className="size-4" />
            {pdf.exporting ? "Menyiapkan…" : "Export PDF"}
          </ButtonAILN>
        </PageHeaderAILN>

        {/* KPI cards — statistics-02 style with icons (same as executive view) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Jam Dihemat Kumulatif",
              icon: Clock,
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
              value: overview ? formatScore(overview.avg_level) : "—",
              unit: overview ? `/ ${overview.max_level_number}` : "/ —",
              footer: (
                <KpiCaptionAILN>
                  {overview ? `skala L0–L${overview.max_level_number}` : "—"}
                </KpiCaptionAILN>
              ),
            },
            {
              title: "Karyawan Tersertifikasi",
              icon: BadgeCheck,
              value: overview ? formatInt(overview.certified_count) : "—",
              unit: overview ? `/ ${overview.member_count}` : "/ —",
              footer: (
                <KpiCaptionAILN>
                  {overview
                    ? `${overview.certified_percent}% selesai ≥ L1`
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
            >
              {kpi.footer}
            </ScorecardAILN>
          ))}
        </div>

        {/* Progres menuju level target — proses (kiri) + hasil akhir (kanan) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
          <SectionContainerAILN
            title={`Proses · % capai ≥ L${TARGET_LEVEL}`}
            desc={`Karyawan yang mencapai ${targetLevelName(levelQ.data)} dari waktu ke waktu`}
            headerRight={
              <GeneralLabelAILN variant="white">data contoh</GeneralLabelAILN>
            }
          >
            {levelQ.isLoading || !levelQ.data ? (
              <SkeletonBlockAILN className="h-56" />
            ) : levelQ.data.total === 0 ? (
              <EmptyHintAILN />
            ) : (
              <ProcessAreaAILN distribution={levelQ.data.distribution} />
            )}
          </SectionContainerAILN>

          <SectionContainerAILN
            title={`Hasil akhir · capai ≥ L${TARGET_LEVEL}`}
            desc="Sudah vs belum mencapai level target"
          >
            {levelQ.isLoading || !levelQ.data ? (
              <SkeletonBlockAILN className="h-56" />
            ) : levelQ.data.total === 0 ? (
              <EmptyHintAILN />
            ) : (
              <ResultDonutAILN distribution={levelQ.data.distribution} />
            )}
          </SectionContainerAILN>
        </div>

        {/* Top performers */}
        <SectionContainerAILN
          title="Top Performers Org-Wide"
          desc="Bintang individual seluruh organisasi · composite score"
          headerRight={
            performersQ.data ? (
              <GeneralLabelAILN variant="white">
                {`${formatInt(performersQ.data.total)} karyawan`}
              </GeneralLabelAILN>
            ) : undefined
          }
        >
          {performersQ.isLoading || !performersQ.data ? (
            <SkeletonBlockAILN className="h-72" />
          ) : performersQ.data.total === 0 ? (
            <EmptyHintAILN />
          ) : (
            <TopPerformersTableAILN list={performersQ.data.list} />
          )}
        </SectionContainerAILN>
      </div>
    </PageContainerAILN>
  );
}
