"use client";
import {
  AILENE_ORG_NAME,
  AILENE_PROGRAM_NAME,
  AILENE_PROGRAM_START,
  AILENE_PROGRAM_TOTAL_WEEKS,
} from "@/lib/ailene-config";
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
import HealthMetricAILN from "@/components/items/HealthMetricAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { SkeletonBlockAILN } from "@/components/states/DataStatesAILN";
import SkeletonExecutiveViewAILN from "@/components/states/SkeletonExecutiveViewAILN";
import TransformationJourneyAILN from "@/components/steppers/TransformationJourneyAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { formatCompactIdr } from "@/lib/ailene-format";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { Clock, Coins, Download, Gauge, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";

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

export default function DashboardSponsorAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const pdf = usePdfReport();
  const executiveQ = trpc.read.executiveView.useQuery();
  const headlineQ = trpc.read.headline.useQuery();
  const orgStatsQ = trpc.read.organizationStats.useQuery();
  const healthQ = trpc.read.programHealth.useQuery();
  const activityQ = trpc.read.recentActivity.useQuery();
  // For the PDF report: data the on-page charts render via child components.
  const levelDistQ = trpc.read.levelDistribution.useQuery();
  const proficiencyQ = trpc.read.proficiencyTrends.useQuery();
  const leaderboardQ = trpc.read.organizationLeaderboard.useQuery();

  if (executiveQ.isLoading) {
    return (
      <PageContainerAILN>
        <SkeletonExecutiveViewAILN />
      </PageContainerAILN>
    );
  }

  if (executiveQ.error || !executiveQ.data) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const metrics = executiveQ.data.metrics;
  const staffActiveWeeklyValue =
    metrics.member_count === 0
      ? "0"
      : metrics.staff_active_weekly_percent.toLocaleString("id-ID");
  const roi = formatCompactIdr(metrics.roi_cohort_to_date);
  const roiUnit = roi.suffix ? `${roi.suffix} Rp` : "Rp";
  const workdaysSaved = Math.round(metrics.hours_saved_total / 8);

  const healthMetrics = healthQ.data?.metrics ?? [];
  const activity = activityQ.data?.activity ?? [];
  const orgStats = orgStatsQ.data;
  const orgName = AILENE_ORG_NAME || "Ringkasan Organisasi";
  const orgSubline = orgStats
    ? `${orgStats.member_count.toLocaleString("id-ID")} staff aktif · ${orgStats.group_count.toLocaleString("id-ID")} departemen · ${AILENE_PROGRAM_NAME}`
    : AILENE_PROGRAM_NAME;

  // Program week derived from the configured start date (env). No start = week 1.
  const programWeek = AILENE_PROGRAM_START
    ? Math.min(
        Math.max(dayjs().diff(dayjs(AILENE_PROGRAM_START), "week") + 1, 1),
        AILENE_PROGRAM_TOTAL_WEEKS
      )
    : 1;
  const headlineUpdated = headlineQ.dataUpdatedAt
    ? dayjs(headlineQ.dataUpdatedAt).locale("id").fromNow()
    : "baru saja";

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
    org: AILENE_ORG_NAME || undefined,
    program: AILENE_PROGRAM_NAME,
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
      ...(levelDistQ.data && levelDistQ.data.levels.length > 0
        ? [
            {
              type: "bar" as const,
              title: "Distribusi Level Organisasi",
              items: levelDistQ.data.levels.map((l) => ({
                label: `${l.code} · ${l.name}`,
                value: l.count,
                display: `${l.count} (${l.percent}%)`,
              })),
            },
          ]
        : []),
      ...(proficiencyQ.data && proficiencyQ.data.weeks.length > 0
        ? [
            {
              type: "trend" as const,
              title: "Tren Penguasaan AI (12 minggu)",
              barName: "% Level 1+",
              lineName: "Rata-rata Level",
              points: proficiencyQ.data.weeks.map((w) => ({
                label: w.label,
                bar: w.level1_plus_percent,
                line: w.avg_level,
              })),
            },
          ]
        : []),
      ...(leaderboardQ.data && leaderboardQ.data.list.length > 0
        ? [
            {
              type: "table" as const,
              title: "Top Departemen (jam dihemat bulan ini)",
              columns: ["#", "Departemen", "Anggota", "Jam"],
              align: ["right", "left", "right", "right"] as (
                | "left"
                | "right"
              )[],
              rows: leaderboardQ.data.list.map((g) => [
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
        <PageHeaderAILN title={orgName} desc={orgSubline}>
          <ButtonAILN
            variant="light"
            size="medium"
            onClick={() => pdf.generate(report, "ringkasan-eksekutif.pdf")}
            disabled={pdf.exporting}
          >
            <Download className="size-4" />
            {pdf.exporting ? "Menyiapkan…" : "Export PDF"}
          </ButtonAILN>
        </PageHeaderAILN>

        {/* Program journey */}
        <TransformationJourneyAILN
          currentWeek={programWeek}
          totalWeeks={AILENE_PROGRAM_TOTAL_WEEKS}
        />

        {/* Headline · bulan ini */}
        {headlineQ.data ? (
          <HeadlineAILN
            productivePercent={headlineQ.data.productive_percent}
            hoursSavedLastWeek={headlineQ.data.hours_saved_last_week}
            roiAnnualized={headlineQ.data.roi_annualized}
            trend={headlineQ.data.trend}
            updatedLabel={headlineUpdated}
          />
        ) : (
          <SkeletonBlockAILN className="h-44" />
        )}

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

        {/* Trend + Distribusi Level (1 row) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <ProficiencyTrendsSponsorAILN />
          <LevelDistributionSponsorAILN />
        </div>

        {/* Top Departemen (kiri) + Kesehatan Program & Aktivitas (kanan) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          {/* Top Departemen */}
          <OrganizationLeaderboardAILN />

          {/* Kanan: Kesehatan Program + Aktivitas terkini */}
          <div className="flex flex-col gap-4">
            {/* Kesehatan Program */}
            <SectionContainerAILN
              title="Kesehatan Program"
              desc="Capaian program vs target · update real-time."
            >
              {healthQ.isLoading ? (
                <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex flex-col gap-2">
                      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-16 animate-pulse rounded bg-muted/60" />
                      <div className="mt-1 h-7 w-16 animate-pulse rounded bg-muted" />
                    </li>
                  ))}
                </ul>
              ) : (
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
              )}
            </SectionContainerAILN>

            {/* Aktivitas terkini */}
            <SectionContainerAILN title="Aktivitas terkini">
              {activityQ.isLoading ? (
                <ul className="flex flex-col gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted/60" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada aktivitas.
                </p>
              ) : (
                <ul className="flex flex-col gap-3 text-sm">
                  {activity.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "var(--destructive)" }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-foreground">
                          <span className="font-semibold">{a.actor}</span>{" "}
                          <span className="text-muted-foreground">
                            {a.action}
                          </span>
                        </div>
                        {a.meta && (
                          <div className="text-xs text-muted-foreground">
                            {a.meta}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {a.time}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionContainerAILN>
          </div>
        </div>
      </div>
    </PageContainerAILN>
  );
}

