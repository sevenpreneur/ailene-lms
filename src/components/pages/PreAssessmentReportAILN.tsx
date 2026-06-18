"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import AppLoadingComponents from "@/components/states/AppLoadingComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { setSessionToken, trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import { ArrowRight, BookOpen, Clock3, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PreAssessmentReportAILNProps {
  sessionToken: string;
}

type PreAssessmentReportData = NonNullable<
  inferRouterOutputs<AppRouter>["read"]["preAssessmentReport"]["report"]
>;

const RECOMMENDATIONS = [
  {
    no: 1,
    source: "Membuat laporan atau rekap rutin",
    title: "Otomasi laporan terjadwal",
    impact: "Tinggi",
    speed: "~70% lebih cepat",
    description:
      "Delegasikan penyusunan laporan rutin sebagai tugas terjadwal yang tetap kamu review sebelum dikirim.",
    lessons: [
      "06 Delegasikan kerja multi-langkah (Cowork)",
      "03 Riset yang bisa dipercaya",
    ],
  },
  {
    no: 2,
    source: "Review / memeriksa dokumen manual",
    title: "Ekstrak, ringkas, dan tandai poin penting otomatis",
    impact: "Tinggi",
    speed: "~60% lebih cepat",
    description:
      "Bangun asisten yang membaca dokumen lalu menyaring poin penting dan keputusan yang perlu kamu ambil.",
    lessons: [
      "01 Bangun asisten kerja pertamamu",
      "03 Riset yang bisa dipercaya",
    ],
  },
  {
    no: 3,
    source: "Meringkas konten panjang",
    title: "Ringkasan terstruktur plus poin aksi",
    impact: "Tinggi",
    speed: "~65% lebih cepat",
    description:
      "Minta ringkasan dengan format poin utama, keputusan, risiko, dan tindak lanjut agar hasilnya siap dipakai.",
    lessons: [
      "F2 Prompting & cara pikir kerja sama AI",
      "03 Riset yang bisa dipercaya",
    ],
  },
] as const;

export default function PreAssessmentReportAILN({
  sessionToken,
}: PreAssessmentReportAILNProps) {
  const router = useRouter();

  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading, isError } = trpc.read.preAssessmentReport.useQuery();

  useEffect(() => {
    if (data && !data.report) {
      router.replace("/student/pre-assessment");
    }
  }, [data, router]);

  if (isLoading || (data && !data.report)) {
    return (
      <PageContainerAILN className="min-h-screen items-start">
        <AppLoadingComponents />
      </PageContainerAILN>
    );
  }
  if (isError || !data || !data.report) {
    return (
      <PageContainerAILN className="min-h-screen items-start">
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  return <PreAssessmentReportContent report={data.report} />;
}

function PreAssessmentReportContent({
  report,
}: {
  report: PreAssessmentReportData;
}) {
  const router = useRouter();
  const userQ = trpc.auth.checkSession.useQuery();
  const firstName = userQ.data?.user?.full_name?.split(" ")[0] ?? "teman";

  return (
    <PageContainerAILN className="min-h-screen items-start justify-start">
      <div className="flex w-full flex-col gap-5">
        <PageHeaderAILN
          title={`Hasil Pre-Assesmentmu, ${firstName}!`}
          desc="Rancangan awal peta skill dan rekomendasi latihan berdasarkan jawaban pre-assessment kamu."
        />

        <SectionContainerAILN
          title="Skill Mapping - Hasil Pre-Assessment"
          headerRight={
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-300" />
                perlu dikuatkan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-300" />
                sudah kuat
              </span>
              <span>skala 1-5</span>
            </div>
          }
          contentClassName="overflow-x-auto"
        >
          <div className="grid min-w-[900px] grid-cols-[150px_repeat(7,minmax(0,1fr))] items-center gap-3 text-center">
            <div className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Dimensi
            </div>
            {report.pillars.map((pillar) => (
              <div
                key={pillar.key}
                className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                {pillar.label}
              </div>
            ))}
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Avg
            </div>

            <div className="text-left text-sm font-bold text-gray-950 dark:text-white">
              Skor Anda
            </div>
            {report.pillars.map((pillar) => (
              <div key={pillar.key} className="flex justify-center">
                <PillarScore score={pillar.score} tone={pillar.tone} />
              </div>
            ))}
            <div className="text-sm font-black text-gray-950 dark:text-white">
              {formatDecimal(report.avg)}
            </div>
            {report.pillars.map((pillar) => (
              <div key={`highlight-${pillar.key}`}>
                {pillar.key === report.strongest.key && (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Terkuat
                  </span>
                )}
                {pillar.key === report.weakest.key && (
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Terendah
                  </span>
                )}
              </div>
            ))}
            <div />
          </div>
        </SectionContainerAILN>

        <SectionContainerAILN
          title="Diagnosa & rekomendasi"
          headerRight={
            <GeneralLabelAILN variant="white">3 use case</GeneralLabelAILN>
          }
        >
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            <TrendingUp className="size-5 shrink-0" />
            <div className="text-sm">
              Total potensi hemat{" "}
              <span className="font-black">~4,9 Jam/minggu</span> dari tugas
              rutin Anda.
            </div>
          </div>

          <div className="mt-5 border-l-4 border-blue-500 pl-4">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Yang Anda ceritakan
            </div>
            <p className="mt-2 max-w-4xl text-base italic leading-7 text-gray-800 dark:text-gray-100">
              &ldquo;{report.quote}&rdquo;
            </p>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Rekomendasi use case paling berdampak untukmu:
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {RECOMMENDATIONS.map((item) => (
                <RecommendationCard key={item.no} item={item} />
              ))}
            </div>
          </div>
        </SectionContainerAILN>

        <div className="flex justify-end">
          <ButtonAILN onClick={() => router.push("/student/learning-path")}>
            Mulai Belajar
            <ArrowRight className="size-4" />
          </ButtonAILN>
        </div>
      </div>
    </PageContainerAILN>
  );
}

function PillarScore({
  score,
  tone,
}: {
  score: number;
  tone: "green" | "yellow";
}) {
  return (
    <span
      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-black ${
        tone === "green"
          ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-400/25 dark:text-emerald-200"
          : "bg-amber-200 text-amber-800 dark:bg-amber-400/25 dark:text-amber-200"
      }`}
    >
      {formatDecimal(score)}
    </span>
  );
}

function formatDecimal(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(".", ",");
}

function RecommendationCard({
  item,
}: {
  item: (typeof RECOMMENDATIONS)[number];
}) {
  return (
    <article className="rounded-lg border border-dashboard-border bg-card-2 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
          {item.no}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <GeneralLabelAILN
              variant="white"
              icon={<Clock3 className="size-3 text-amber-500" />}
            >
              {item.source}
            </GeneralLabelAILN>
            <GeneralLabelAILN variant="red">
              Impact: {item.impact}
            </GeneralLabelAILN>
            <GeneralLabelAILN variant="green">{item.speed}</GeneralLabelAILN>
          </div>

          <h3 className="mt-3 text-base font-bold text-gray-950 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {item.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Dipelajari di:
            </span>
            {item.lessons.map((lesson) => (
              <GeneralLabelAILN
                key={lesson}
                variant="white"
                icon={<BookOpen className="size-3 text-blue-500" />}
              >
                {lesson}
                <ArrowRight className="size-3" />
              </GeneralLabelAILN>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
