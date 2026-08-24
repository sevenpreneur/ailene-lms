"use client";

import { ORG_NAME, PROGRAM_NAME } from "@/lib/config";
import {
  usePdfReport,
  type ReportProps,
} from "@/components/pdf/AileneReportPDF";
import dayjs from "dayjs";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import GroupLevelDistributionAILN from "@/components/charts/GroupLevelDistributionAILN";
import AttentionMemberRowAILN from "@/components/items/AttentionMemberRowAILN";
import GroupUseCaseRowAILN from "@/components/items/GroupUseCaseRowAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { EmptyStateAILN } from "@/components/states/DataStatesAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { formatDecimal, formatScore } from "@/lib/format";
import { useProjectId } from "@/lib/use-project-id";
import {
  getGroupAttentionMembersMock,
  getGroupDepartmentsMock,
  getGroupLevelDistributionMock,
  getGroupOverviewMock,
  getGroupTopUseCasesMock,
} from "@/mock-data/sponsor";
import { ChevronDown, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GroupDetailsSponsorAILN({
  groupId,
}: {
  groupId: number;
}) {
  const router = useRouter();
  const projectId = useProjectId();
  const pdf = usePdfReport();
  const input = { group_id: groupId };
  const departments = getGroupDepartmentsMock();
  const overview = getGroupOverviewMock(input);
  const distribution = getGroupLevelDistributionMock(input);
  const topUseCases = getGroupTopUseCasesMock(input);
  const attention = getGroupAttentionMembersMock(input);

  if (!overview) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const group = overview.group;
  const metrics = overview.metrics;
  const selectedDepartment = departments.departments.find(
    (department) => department.id === groupId
  );

  const groupKpis = [
    {
      label: "Anggota aktif",
      value: `${metrics.active_members}`,
      unit: `/ ${metrics.total_members}`,
      sub: `${metrics.active_percent}% partisipasi mingguan`,
      percent: metrics.active_percent,
    },
    {
      label: "Avg level",
      value: formatScore(metrics.avg_level),
      unit: "dari 4",
      sub: `${metrics.beginner_count} org L0-L1 atau bawah`,
      percent: (metrics.avg_level / 4) * 100,
    },
    {
      label: "Jam dihemat",
      value: formatDecimal(metrics.hours_saved_total),
      unit: "jam",
      sub: "Estimasi dari use case diterima",
      percent: Math.min(100, metrics.hours_saved_total / 5),
    },
    {
      label: "Use case diterima",
      value: `${metrics.accepted_use_cases}`,
      unit: "total",
      sub: `+${metrics.accepted_use_cases_this_month} bulan ini`,
      percent: Math.min(100, metrics.accepted_use_cases * 4),
    },
  ];

  const buildReport = (): ReportProps => {
    const sections: ReportProps["sections"] = [
      {
        type: "kpi",
        title: "Indikator Departemen",
        items: [
          {
            label: "Partisipasi Mingguan",
            value: `${metrics.active_members}`,
            unit: `/ ${metrics.total_members}`,
            footer: `${metrics.active_percent}% aktif minggu ini`,
          },
          {
            label: "Avg Level",
            value: formatScore(metrics.avg_level),
            unit: "/ 4",
            footer: `${metrics.beginner_count} org di L0–L1`,
          },
          {
            label: "Jam Dihemat",
            value: formatDecimal(metrics.hours_saved_total),
            unit: "jam",
            footer: "kumulatif",
          },
          {
            label: "Use Case Diterima",
            value: `${metrics.accepted_use_cases}`,
            footer: `+${metrics.accepted_use_cases_this_month} bulan ini`,
          },
        ],
      },
    ];
    const levels = distribution.levels;
    if (levels.length > 0) {
      sections.push({
        type: "table",
        title: "Distribusi Level",
        columns: ["Level", "Karyawan", "%"],
        align: ["left", "right", "right"],
        rows: levels.map((l) => [
          `${l.code} · ${l.name}`,
          formatDecimal(l.count),
          `${l.percent}%`,
        ]),
      });
    }
    const useCases = topUseCases.use_cases;
    if (useCases.length > 0) {
      sections.push({
        type: "table",
        title: "Top Use Case",
        columns: ["Use case", "Level", "Submit", "%"],
        align: ["left", "left", "right", "right"],
        rows: useCases.map((u) => [
          u.name,
          u.level_name,
          formatDecimal(u.count),
          `${u.percent}%`,
        ]),
      });
    }
    const members = attention.members;
    if (members.length > 0) {
      sections.push({
        type: "table",
        title: "Karyawan Perlu Perhatian",
        columns: ["Karyawan", "Jabatan", "Level", "Status", "UC"],
        align: ["left", "left", "right", "left", "right"],
        rows: members.map((m) => [
          m.full_name,
          m.job_title,
          `L${m.level_number}`,
          m.status,
          formatDecimal(m.accepted_use_cases),
        ]),
      });
    }
    return {
      org: ORG_NAME || undefined,
      program: PROGRAM_NAME,
      title: `Departemen ${group.name}`,
      subtitle: `${metrics.total_members} karyawan · Champion ${group.champion.full_name} · ${metrics.beginner_percent}% pemula`,
      generatedAt: dayjs().format("D MMMM YYYY"),
      sections,
    };
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-5">
        <PageHeaderAILN
          title={group.name}
          desc={`${metrics.total_members} karyawan · Champion ${group.champion.full_name} · ${metrics.beginner_percent}% masih di level pemula.`}
        >
          {metrics.needs_intervention && (
            <GeneralLabelAILN variant="yellow">Perlu intervensi</GeneralLabelAILN>
          )}
          <label className="relative inline-flex items-center">
            <select
              value={selectedDepartment?.id ?? groupId}
              onChange={(event) =>
                router.push(`/${projectId}/sponsor/groups/${event.target.value}`)
              }
              className="h-9 appearance-none rounded-md border border-dashboard-border bg-white pl-3 pr-8 text-xs font-medium text-gray-700 outline-none transition hover:bg-gray-50 dark:bg-card-1 dark:text-gray-200 dark:hover:bg-card-2"
            >
              {departments.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-4 text-gray-400" />
          </label>
          <ButtonAILN
            variant="light"
            size="medium"
            onClick={() =>
              pdf.generate(buildReport(), `departemen-${group.name}.pdf`)
            }
            disabled={pdf.exporting}
          >
            <Download className="size-4" />
            {pdf.exporting ? "Menyiapkan…" : "Export"}
          </ButtonAILN>
        </PageHeaderAILN>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {groupKpis.map((kpi, index) => (
            <ScorecardAILN
              key={index}
              title={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
            >
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
                <div
                  className="h-full rounded-full bg-gray-900 dark:bg-gray-100"
                  style={{
                    width: `${Math.min(100, Math.max(0, kpi.percent))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{kpi.sub}</p>
            </ScorecardAILN>
          ))}
        </div>

        <SectionContainerAILN
          title={`Distribusi level - ${group.name}`}
          desc={`${distribution.total_members} karyawan`}
          className="dark:shadow-[0_0_16px_rgba(26,122,82,0.06)]"
        >
          <GroupLevelDistributionAILN levels={distribution.levels} />
        </SectionContainerAILN>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          <SectionContainerAILN
            title={`Top use case - ${group.name}`}
            className="dark:shadow-[0_0_16px_rgba(26,122,82,0.06)]"
          >
            {topUseCases.use_cases.length === 0 ? (
              <EmptyStateAILN>
                Belum ada use case diterima di departemen ini.
              </EmptyStateAILN>
            ) : (
              <div className="flex flex-col gap-3">
                {topUseCases.use_cases.map((useCase, index) => (
                  <GroupUseCaseRowAILN
                    key={useCase.id}
                    rank={index + 1}
                    name={useCase.name}
                    level={useCase.level_name}
                    count={useCase.count}
                    percent={useCase.percent}
                  />
                ))}
              </div>
            )}
          </SectionContainerAILN>

          <SectionContainerAILN
            title="Anggota"
            className="dark:shadow-[0_0_16px_rgba(26,122,82,0.06)]"
            headerRight={
              <GeneralLabelAILN variant="yellow">
                {attention.lagging_count} ketinggalan
              </GeneralLabelAILN>
            }
          >
            {attention.members.length === 0 ? (
              <EmptyStateAILN>
                Belum ada anggota di departemen ini.
              </EmptyStateAILN>
            ) : (
              <div className="-mx-5 -mb-5 flex flex-col">
                {attention.members.map((member) => (
                  <AttentionMemberRowAILN key={member.id} member={member} />
                ))}
              </div>
            )}
          </SectionContainerAILN>
        </div>
      </div>
    </PageContainerAILN>
  );
}
