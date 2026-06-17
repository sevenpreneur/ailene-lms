"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import LevelCompositionAILN from "@/components/charts/LevelCompositionAILN";
import WorkforceLevelByDeptAILN from "@/components/charts/WorkforceLevelByDeptAILN";
import WorkforceMembersAILN from "@/components/indexes/WorkforceMembersAILN";
import LegendStatAILN from "@/components/items/LegendStatAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { EmptyStateAILN } from "@/components/states/DataStatesAILN";
import SkeletonLevelDistributionAILN from "@/components/states/SkeletonLevelDistributionAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AILENE_ORG_NAME, AILENE_PROGRAM_NAME } from "@/lib/ailene-config";
import {
  usePdfReport,
  type ReportProps,
} from "@/components/pdf/AileneReportPDF";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import { Download } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Cell, Pie, PieChart } from "recharts";

const BRAND_GREEN = "#1f5f4e"; // active / participating
const SLATE_200 = "#e2e8f0"; // not yet active
const SPONSOR_INK = "#111827"; // emphasis text

const participationConfig = {
  active: { label: "Aktif", color: BRAND_GREEN },
  inactive: { label: "Belum aktif", color: SLATE_200 },
} satisfies ChartConfig;

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
  const inactive = Math.max(data.total - data.active_weekly, 0);
  const levelNameByCode = new Map(data.levels.map((l) => [l.code, l.name]));
  const participation = [
    {
      key: "active",
      label: "Aktif",
      value: data.active_weekly,
      fill: BRAND_GREEN,
    },
    { key: "inactive", label: "Belum aktif", value: inactive, fill: SLATE_200 },
  ];

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
            totalMembers={data.total}
          />
          <LevelCompositionAILN levels={data.levels} total={data.total} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SectionContainerAILN title="Tingkat Partisipasi">
            <div className="flex flex-1 flex-wrap items-center justify-center gap-x-8 gap-y-4 py-2">
              {/* Donut: aktif vs belum aktif, persen di tengah */}
              <div className="relative">
                <ChartContainer
                  config={participationConfig}
                  className="aspect-square h-44"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          className="border border-dashboard-border bg-popover text-popover-foreground shadow-md"
                        />
                      }
                    />
                    <Pie
                      data={participation}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={56}
                      outerRadius={76}
                      paddingAngle={2}
                      cornerRadius={5}
                      strokeWidth={0}
                    >
                      {participation.map((p) => (
                        <Cell key={p.key} fill={p.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold leading-none text-foreground">
                    {data.participation_percent}%
                  </span>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    aktif
                  </span>
                </div>
              </div>

              {/* Legenda + konteks */}
              <div className="flex w-44 flex-col gap-3">
                <LegendStatAILN
                  color={BRAND_GREEN}
                  label="Aktif"
                  value={data.active_weekly}
                />
                <LegendStatAILN
                  color={SLATE_200}
                  label="Belum aktif"
                  value={inactive}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.active_weekly} dari {data.total} karyawan login minimal
                  1x minggu ini.
                </p>
              </div>
            </div>
          </SectionContainerAILN>

          <SectionContainerAILN
            title="Departemen perlu intervensi"
            headerRight={
              <span
                className="text-xs font-bold"
                style={{ color: SPONSOR_INK }}
              >
                {data.groups_needing_intervention.length} dept
              </span>
            }
            contentClassName="flex flex-col gap-2"
          >
            {data.groups_needing_intervention.length === 0 ? (
              <EmptyStateAILN>
                Tidak ada departemen dengan komposisi L0-L1 di atas threshold.
              </EmptyStateAILN>
            ) : (
              data.groups_needing_intervention.slice(0, 4).map((group) => (
                <Link
                  key={group.id}
                  href={`/sponsor/groups/${group.id}`}
                  className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">
                        {group.name}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {group.entry_level_count} L0-L1 / {group.total} total ·{" "}
                        {group.entry_level_percent}% pemula
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: SPONSOR_INK }}
                    >
                      Lihat detail
                    </span>
                  </div>
                </Link>
              ))
            )}
          </SectionContainerAILN>
        </div>

        <WorkforceMembersAILN />
      </div>
    </PageContainerAILN>
  );
}
