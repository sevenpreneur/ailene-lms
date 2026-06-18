"use client";
import { AILENE_ORG_NAME, AILENE_PROGRAM_NAME } from "@/lib/ailene-config";
import {
  usePdfReport,
  type ReportProps,
} from "@/components/pdf/AileneReportPDF";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import SectionNoteAILN from "@/components/elements/SectionNoteAILN";
import DepartmentFilterAILN from "@/components/fields/DepartmentFilterAILN";
import ShareBarRowAILN from "@/components/items/ShareBarRowAILN";
import KpiCaptionAILN from "@/components/labels/KpiCaptionAILN";
import VoiceChipAILN from "@/components/labels/VoiceChipAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import {
  EmptyHintAILN,
  SkeletonBlockAILN,
  SkeletonRowsAILN,
} from "@/components/states/DataStatesAILN";
import { ShareBarList } from "@/components/share-bar-list";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { ClipboardCheck, Download, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// ---------- Page ----------

export default function DashboardPreAssesmentAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const pdf = usePdfReport();
  const [groupId, setGroupId] = useState<number | undefined>(undefined);
  const filter = { group_id: groupId };

  const departmentsQ = trpc.read.preAssessment.departments.useQuery();
  const overviewQ = trpc.read.preAssessment.overview.useQuery(filter);
  const frequencyQ =
    trpc.read.preAssessment.usageFrequency.useQuery(filter);
  const toolsQ = trpc.read.preAssessment.tools.useQuery(filter);
  const maturityQ =
    trpc.read.preAssessment.teamMaturity.useQuery(filter);
  const useCasesQ = trpc.read.preAssessment.topUseCases.useQuery(filter);
  const voiceQ = trpc.read.preAssessment.voice.useQuery(filter);

  const overview = overviewQ.data;
  const measuredLabel = overview?.measured_at
    ? dayjs(overview.measured_at).locale("id").format("D MMMM YYYY")
    : "—";

  const buildReport = (): ReportProps => {
    const sections: ReportProps["sections"] = [];
    if (overview) {
      sections.push({
        type: "kpi",
        title: "Ringkasan Kondisi Awal",
        items: [
          {
            label: "Partisipasi",
            value: `${overview.participation_percent}%`,
            footer: `${overview.completed_count} dari ${overview.total_members} karyawan`,
          },
          {
            label: "Pengguna Rutin AI",
            value: `${overview.routine_users_percent}%`,
            footer: "pakai AI rutin (q1)",
          },
        ],
      });
    }
    if (frequencyQ.data) {
      sections.push({
        type: "table",
        title: "Frekuensi Pemakaian AI",
        columns: ["Kategori", "%"],
        align: ["left", "right"],
        rows: frequencyQ.data.buckets.map((b) => [b.label, `${b.percent}%`]),
      });
    }
    if (toolsQ.data && toolsQ.data.tools.length > 0) {
      sections.push({
        type: "table",
        title: "Tools AI Terpakai",
        columns: ["Tool", "%"],
        align: ["left", "right"],
        rows: toolsQ.data.tools.map((t) => [t.label, `${t.percent}%`]),
      });
    }
    if (maturityQ.data) {
      sections.push({
        type: "table",
        title: "Kematangan Tim",
        columns: ["Kategori", "%"],
        align: ["left", "right"],
        rows: maturityQ.data.buckets.map((b) => [b.label, `${b.percent}%`]),
      });
    }
    if (useCasesQ.data && useCasesQ.data.useCases.length > 0) {
      sections.push({
        type: "table",
        title: "Use Case Paling Diincar",
        columns: ["Use case", "%"],
        align: ["left", "right"],
        rows: useCasesQ.data.useCases.map((u) => [u.label, `${u.percent}%`]),
      });
    }
    return {
      org: AILENE_ORG_NAME || undefined,
      program: AILENE_PROGRAM_NAME,
      title: "Laporan Pre-Assessment",
      subtitle: overview
        ? `${overview.completed_count} dari ${overview.total_members} karyawan · diukur ${measuredLabel}`
        : undefined,
      generatedAt: dayjs().locale("id").format("D MMMM YYYY"),
      sections,
    };
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Baseline AI State Organisasi"
          desc={`Snapshot kondisi awal · diukur ${measuredLabel} · ${
            overview
              ? `${overview.completed_count} dari ${overview.total_members} karyawan menyelesaikan pre-assessment`
              : "— dari — karyawan menyelesaikan pre-assessment"
          }`}
        >
          <ButtonAILN
            variant="light"
            size="medium"
            onClick={() =>
              pdf.generate(buildReport(), "pre-assessment-report.pdf")
            }
            disabled={pdf.exporting || !overview}
          >
            <Download className="size-4" />
            {pdf.exporting ? "Menyiapkan…" : "Export PDF"}
          </ButtonAILN>
        </PageHeaderAILN>

        {/* Filter row */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashboard-border bg-white px-4 py-3 dark:bg-card-1">
          <div className="flex flex-wrap items-center gap-3">
            <DepartmentFilterAILN
              departments={departmentsQ.data?.departments ?? []}
              totalMembers={departmentsQ.data?.total_members ?? 0}
              groupId={groupId}
              onChange={setGroupId}
            />
            <span className="rounded-full border border-dashboard-border bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-card-2 dark:text-gray-300">
              Titik nol — sebelum modul pertama
            </span>
          </div>
        </div>

        {/* KPI tiles — statistics-02 style with icons (same as executive view) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              title: "Partisipasi Pre-assessment",
              icon: ClipboardCheck,
              value: overview ? `${overview.participation_percent}` : "—",
              unit: "%",
              footer: (
                <KpiCaptionAILN>
                  {overview
                    ? `${overview.completed_count} dari ${overview.total_members} karyawan`
                    : "—"}
                </KpiCaptionAILN>
              ),
            },
            {
              title: "Pemakai AI Rutin",
              icon: Zap,
              value: overview ? `${overview.routine_users_percent}` : "—",
              unit: "%",
              footer: <KpiCaptionAILN>harian atau lebih sering (q1)</KpiCaptionAILN>,
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

        {/* Usage frequency */}
        <div className="grid grid-cols-1 gap-4">
          <SectionContainerAILN
            title="Frekuensi pemakaian AI"
            desc={`Sebelum program · % dari ${frequencyQ.data?.respondents ?? "—"} responden (q1)`}
            className="dark:shadow-[0_0_16px_rgba(0,53,157,0.06)]"
          >
            {frequencyQ.isLoading || !frequencyQ.data ? (
              <SkeletonRowsAILN rowClassName="h-12" className="gap-0.5" />
            ) : (
              <ShareBarList>
                {frequencyQ.data.buckets.map((b) => (
                  <ShareBarRowAILN
                    key={b.key}
                    label={b.label}
                    percent={b.percent}
                    tone={b.highlight ? "highlight" : "neutral"}
                  />
                ))}
              </ShareBarList>
            )}
            <SectionNoteAILN>
              Tersorot = pemakai rutin (harian+). Mayoritas masih sporadis — ruang
              besar untuk peningkatan adopsi.
            </SectionNoteAILN>
          </SectionContainerAILN>
        </div>

        {/* Penetrasi tools · Kematangan adopsi · Use case
            — 1 kolom (HP) → 2 (tablet) → 3 sejajar (desktop) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SectionContainerAILN
            title="Penetrasi tools AI"
            desc={`Pernah dipakai · multi-pilih · % responden (q2)`}
            className="dark:shadow-[0_0_16px_rgba(0,53,157,0.06)]"
          >
            {toolsQ.isLoading || !toolsQ.data ? (
              <SkeletonRowsAILN rowClassName="h-12" className="gap-0.5" />
            ) : toolsQ.data.tools.length === 0 ? (
              <EmptyHintAILN className="h-24">Belum ada data responden.</EmptyHintAILN>
            ) : (
              <ShareBarList>
                {toolsQ.data.tools.map((t) => (
                  <ShareBarRowAILN
                    key={t.label}
                    label={t.label}
                    percent={t.percent}
                    tone="neutral"
                  />
                ))}
              </ShareBarList>
            )}
          </SectionContainerAILN>

          <SectionContainerAILN
            title="Kematangan adopsi tim"
            desc="Kondisi adopsi di departemen masing-masing (q8)"
            className="dark:shadow-[0_0_16px_rgba(0,53,157,0.06)]"
          >
            {maturityQ.isLoading || !maturityQ.data ? (
              <SkeletonRowsAILN rowClassName="h-12" className="gap-0.5" />
            ) : (
              <ShareBarList>
                {maturityQ.data.buckets.map((b) => (
                  <ShareBarRowAILN
                    key={b.key}
                    label={b.label}
                    percent={b.percent}
                    tone={b.highlight ? "highlight" : "neutral"}
                  />
                ))}
              </ShareBarList>
            )}
            {maturityQ.data && (
              <SectionNoteAILN>
                Hanya {maturityQ.data.formal_percent}% tim punya
                kebijakan/integrasi resmi — sisanya belum terstruktur.
              </SectionNoteAILN>
            )}
          </SectionContainerAILN>

          <SectionContainerAILN
            title="Use case paling diincar"
            desc="Untuk apa AI ingin dipakai · % responden (q7)"
            className="dark:shadow-[0_0_16px_rgba(0,53,157,0.06)]"
          >
            {useCasesQ.isLoading || !useCasesQ.data ? (
              <SkeletonRowsAILN rowClassName="h-12" className="gap-0.5" />
            ) : useCasesQ.data.useCases.length === 0 ? (
              <EmptyHintAILN className="h-24">Belum ada data responden.</EmptyHintAILN>
            ) : (
              <ShareBarList>
                {useCasesQ.data.useCases.map((u) => (
                  <ShareBarRowAILN
                    key={u.label}
                    leading={
                      <span className="w-4 shrink-0 text-right text-xs tabular-nums text-gray-400 dark:text-gray-500">
                        {u.rank}
                      </span>
                    }
                    label={u.label}
                    percent={u.percent}
                    tone={u.highlight ? "highlight" : "neutral"}
                  />
                ))}
              </ShareBarList>
            )}
            <SectionNoteAILN>
              Sinyal untuk Champion: prioritaskan konten menulis & meringkas —
              kebutuhan terbesar lintas departemen.
            </SectionNoteAILN>
          </SectionContainerAILN>
        </div>

        {/* Voice of employees */}
        <SectionContainerAILN
          title="Suara karyawan"
          desc="Klaster tema dari jawaban terbuka · angka = jumlah penyebutan"
          className="dark:shadow-[0_0_16px_rgba(0,53,157,0.06)]"
        >
          {voiceQ.isLoading || !voiceQ.data ? (
            <SkeletonBlockAILN className="h-32" />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-3 text-[11px] font-semibold tracking-widest text-gray-500 dark:text-gray-400">
                    TANTANGAN TERBESAR (Q13)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {voiceQ.data.challenges.map((c) => (
                      <VoiceChipAILN
                        key={c.label}
                        label={c.label}
                        count={c.count}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 text-[11px] font-semibold tracking-widest text-gray-500 dark:text-gray-400">
                    EKSPEKTASI PELATIHAN (Q14)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {voiceQ.data.expectations.map((e) => (
                      <VoiceChipAILN
                        key={e.label}
                        label={e.label}
                        count={e.count}
                        tone="green"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-dashboard-border pt-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Motivasi tinggi (siap mencoba):{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {voiceQ.data.motivated_percent}%
                  </span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Sikap mendukung dengan panduan jelas:{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {voiceQ.data.supportive_percent}%
                  </span>
                </span>
              </div>
            </div>
          )}
        </SectionContainerAILN>
      </div>
    </PageContainerAILN>
  );
}
