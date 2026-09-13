"use client";
import {
  ORG_NAME,
  PROGRAM_NAME,
  PROGRAM_START_ISO,
  PROGRAM_TOTAL_WEEKS,
} from "@/lib/config";
import {
  usePdfReport,
  type ReportProps,
} from "@/components/pdf/AileneReportPDF";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import LevelDistributionSponsorAILN from "@/components/charts/LevelDistributionSponsorAILN";
import ProficiencyTrendsSponsorAILN from "@/components/charts/ProficiencyTrendsSponsorAILN";
import HeadlineAILN from "@/components/heroes/HeadlineAILN";
import OrganizationLeaderboardAILN from "@/components/indexes/OrganizationLeaderboardAILN";
import RecentActivityAILN from "@/components/indexes/RecentActivityAILN";
import HealthMetricAILN from "@/components/items/HealthMetricAILN";
import SponsorStatLabelAILN from "@/components/labels/SponsorStatLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import TransformationJourneyAILN from "@/components/steppers/TransformationJourneyAILN";
import { formatCompactIdr } from "@/lib/format";
import {
  getExecutiveViewMock,
  getHeadlineMock,
  getLevelDistributionMock,
  getOrganizationLeaderboardMock,
  getOrganizationStatsMock,
  getProficiencyTrendsMock,
  getProgramHealthMock,
  getSponsorRecentActivityMock,
} from "@/mock-data/sponsor";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { Building2, Clock, Coins, Download, Gauge, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

dayjs.extend(relativeTime);

// Floor an avg level (0..4) to its tier name for the card caption.
function tierLabel(level: number): string {
  const names = [
    "Assessment",
    "AI Foundation",
    "AI Operator",
    "AI Intermediate",
    "AI Advanced",
  ];
  const idx = Math.min(Math.max(Math.floor(level), 0), names.length - 1);
  return `Level ${idx} · ${names[idx]}`;
}

// ---------- Component ----------

export default function DashboardSponsorAILN() {
  const pdf = usePdfReport();
  const executiveData = getExecutiveViewMock();
  const headlineData = getHeadlineMock();
  const orgStats = getOrganizationStatsMock();
  const healthData = getProgramHealthMock();
  const activityData = getSponsorRecentActivityMock();
  // For the PDF report: data the on-page charts render via child components.
  const levelDistData = getLevelDistributionMock();
  const proficiencyData = getProficiencyTrendsMock();
  const leaderboardData = getOrganizationLeaderboardMock();

  const metrics = executiveData.metrics;
  const staffActiveWeeklyValue =
    metrics.member_count === 0
      ? "0"
      : metrics.staff_active_weekly_percent.toLocaleString("id-ID");
  const roi = formatCompactIdr(metrics.roi_cohort_to_date);
  const roiUnit = roi.suffix ? `${roi.suffix} Rp` : "Rp";
  const workdaysSaved = Math.round(metrics.hours_saved_total / 8);

  const healthMetrics = healthData.metrics;
  const activity = activityData.activity;
  const orgName = ORG_NAME || "Ringkasan Organisasi";
  const activeStaffCount = metrics.staff_active_weekly_count.toLocaleString("id-ID");
  const departmentCount = orgStats.group_count.toLocaleString("id-ID");

  // Program week derived from the configured start date (env). No start = week 1.
  const programWeek = PROGRAM_START_ISO
    ? Math.min(
        Math.max(dayjs().diff(dayjs(PROGRAM_START_ISO), "week") + 1, 1),
        PROGRAM_TOTAL_WEEKS
      )
    : 1;

  const kpiCards: {
    title: string;
    value: string;
    unit: string;
    footer: string;
    icon: LucideIcon;
    accent: { tile: string; icon: string };
  }[] = [
    {
      title: "Avg Level Organisasi",
      icon: Gauge,
      accent: {
        tile: "bg-violet-50 dark:bg-violet-500/15",
        icon: "text-violet-600 dark:text-violet-300",
      },
      value: metrics.avg_level.toLocaleString("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      unit: "/ 4",
      footer: tierLabel(metrics.avg_level),
    },
    {
      title: "Jam Dihemat (Kumulatif)",
      icon: Clock,
      accent: {
        tile: "bg-sky-50 dark:bg-sky-500/15",
        icon: "text-sky-600 dark:text-sky-300",
      },
      value: metrics.hours_saved_total.toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      }),
      unit: "jam",
      footer: `≈ ${workdaysSaved.toLocaleString("id-ID")} hari kerja`,
    },
    {
      title: "ROI (Cohort-to-date)",
      icon: Coins,
      accent: {
        tile: "bg-emerald-50 dark:bg-emerald-500/15",
        icon: "text-emerald-600 dark:text-emerald-300",
      },
      value: roi.value,
      unit: roiUnit,
      footer: `dari ${metrics.hours_saved_total.toLocaleString("id-ID")} jam dihemat`,
    },
    {
      title: "Staff Aktif Mingguan",
      icon: Users,
      accent: {
        tile: "bg-amber-50 dark:bg-amber-500/15",
        icon: "text-amber-600 dark:text-amber-300",
      },
      value: staffActiveWeeklyValue,
      unit: "%",
      footer: `${metrics.staff_active_weekly_count.toLocaleString("id-ID")} dari ${metrics.member_count.toLocaleString("id-ID")} staff aktif`,
    },
  ];

  const report: ReportProps = {
    org: ORG_NAME || undefined,
    program: PROGRAM_NAME,
    title: "Ringkasan Eksekutif",
    subtitle: orgStats
      ? `${orgStats.member_count.toLocaleString("id-ID")} staff · ${orgStats.group_count.toLocaleString("id-ID")} departemen`
      : undefined,
    generatedAt: dayjs().format("D MMMM YYYY"),
    sections: [
      {
        type: "kpi",
        title: "Indikator Utama",
        items: kpiCards.map((k) => ({
          label: k.title,
          value: k.value,
          unit: k.unit,
          footer: k.footer,
        })),
      },
      {
        type: "kpi",
        title: "Kesehatan Program",
        items: healthMetrics.map((h) => ({
          label: h.label,
          value: `${h.percent}%`,
          footer: h.detail,
        })),
      },
      ...(levelDistData.levels.length > 0
        ? [
            {
              type: "bar" as const,
              title: "Distribusi Level Organisasi",
              items: levelDistData.levels.map((l) => ({
                label: `${l.code} · ${l.name}`,
                value: l.count,
                display: `${l.count} (${l.percent}%)`,
              })),
            },
          ]
        : []),
      ...(proficiencyData.weeks.length > 0
        ? [
            {
              type: "trend" as const,
              title: "Tren Skor Kompetensi",
              firstLineName: "Rata-rata XP",
              secondLineName: "Rata-rata Level",
              points: proficiencyData.weeks.map((w) => ({
                label: w.label,
                firstLine: w.avg_xp,
                secondLine: w.avg_level,
              })),
            },
          ]
        : []),
      ...(leaderboardData.list.length > 0
        ? [
            {
              type: "table" as const,
              title: "Top Departemen (jam dihemat bulan ini)",
              columns: ["#", "Departemen", "Anggota", "Jam"],
              align: ["right", "left", "right", "right"] as (
                | "left"
                | "right"
              )[],
              rows: leaderboardData.list.map((g) => [
                g.rank,
                g.name,
                g.member_count.toLocaleString("id-ID"),
                g.hours.toLocaleString("id-ID"),
              ]),
            },
          ]
        : []),
      {
        type: "list",
        title: "Aktivitas Terkini",
        items:
          activity.length > 0
            ? activity.map((a) => ({
                primary: `${a.actor} — ${a.action}`,
                secondary: a.meta || undefined,
                trailing: a.time,
              }))
            : [{ primary: "Belum ada aktivitas." }],
      },
    ],
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <header className="sticky top-14 z-30 -mx-4 -mt-6 flex flex-wrap items-center justify-between gap-3 border-b lg:top-0 border-dashboard-border bg-background/80 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6 xl:-mx-8 xl:px-8">
          <h1 className="display-font text-xl font-bold tracking-tight text-foreground">
            {orgName}
          </h1>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <SponsorStatLabelAILN
              icon={Users}
              value={activeStaffCount}
              label="staff aktif"
            />
            <SponsorStatLabelAILN
              icon={Building2}
              value={departmentCount}
              label="departemen"
            />
            <ButtonAILN
              variant="light"
              size="medium"
              onClick={() => pdf.generate(report, "ringkasan-eksekutif.pdf")}
              disabled={pdf.exporting}
            >
              <Download className="size-4" />
              {pdf.exporting ? "Menyiapkan…" : "Export PDF"}
            </ButtonAILN>
          </div>
        </header>

        {/* Program journey */}
        <TransformationJourneyAILN
          currentWeek={programWeek}
          totalWeeks={PROGRAM_TOTAL_WEEKS}
        />

        {/* Headline · bulan ini */}
        <HeadlineAILN
          productivePercent={headlineData.productive_percent}
          hoursSavedLastWeek={headlineData.hours_saved_last_week}
          roiAnnualized={headlineData.roi_annualized}
          trend={headlineData.trend}
          updatedLabel="baru saja"
        />

        {/* KPI strip — standardized ScorecardAILN cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((k, i) => (
            <ScorecardAILN
              key={i}
              title={k.title}
              value={k.value}
              unit={k.unit}
              icon={k.icon}
              accent={k.accent}
            >
              <p className="text-xs text-muted-foreground">{k.footer}</p>
            </ScorecardAILN>
          ))}
        </div>

        {/* Distribusi Karyawan (kiri, lebih lebar) + Tren Skor Kompetensi (kanan) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <LevelDistributionSponsorAILN />
          <ProficiencyTrendsSponsorAILN />
        </div>

        {/* Kinerja per Departemen (full width) */}
        <OrganizationLeaderboardAILN />

        {/* Kesehatan Program + Aktivitas terkini */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionContainerAILN
              title="Kesehatan Program"
              desc="Capaian program vs target · update real-time."
            >
              <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {healthMetrics.map((h) => (
                  <HealthMetricAILN
                    key={h.key}
                    label={h.label}
                    name={h.name}
                    percent={h.percent}
                    detail={h.detail}
                  />
                ))}
              </ul>
            </SectionContainerAILN>

            <RecentActivityAILN />
        </div>
      </div>
    </PageContainerAILN>
  );
}
