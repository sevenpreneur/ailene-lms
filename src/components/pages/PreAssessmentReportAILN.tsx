"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import AppLoadingComponents from "@/components/states/AppLoadingComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { CheckSession } from "@/lib/actions";
import { setSessionToken, trpc } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import type { PreAssessmentRecommendation } from "@/lib/pre-assessment-report";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock3,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PreAssessmentReportAILNProps {
  sessionToken: string;
}

type PreAssessmentReportData = NonNullable<
  inferRouterOutputs<AppRouter>["read"]["preAssessmentReport"]["report"]
>;

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
  const utils = trpc.useUtils();
  const userQ = useQuery({ queryKey: ["session"], queryFn: CheckSession });
  const firstName = userQ.data?.user?.full_name?.split(" ")[0] ?? "teman";

  // Poll the recommendation endpoint while the worker is still generating.
  const recQ = trpc.read.preAssessmentRecommendations.useQuery(undefined, {
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 4000 : false;
    },
  });

  const regenerate = trpc.create.regeneratePreAssessmentReport.useMutation({
    onSuccess: () => utils.read.preAssessmentRecommendations.invalidate(),
  });

  // Default to "processing" until the first response lands so the UI shows the
  // loading skeleton rather than flashing the failed/empty state.
  const status = recQ.data?.status ?? "processing";
  const recommendations = recQ.data?.recommendations ?? null;
  const items = recommendations?.items ?? [];

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
            <div />
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
            status === "completed" ? (
              <GeneralLabelAILN variant="white">
                {items.length} use case
              </GeneralLabelAILN>
            ) : undefined
          }
        >
          {status === "completed" && recommendations?.time_saved_label && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <TrendingUp className="size-5 shrink-0" />
              <div className="text-sm">
                Total potensi hemat{" "}
                <span className="font-black">
                  {recommendations.time_saved_label}
                </span>{" "}
                dari tugas rutin Anda.
              </div>
            </div>
          )}

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
            <div className="mt-3">
              {status === "completed" && items.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {items.map((item, idx) => (
                    <RecommendationCard key={idx} no={idx + 1} item={item} />
                  ))}
                </div>
              ) : status === "failed" ? (
                <RecommendationsFailed
                  onRetry={() => regenerate.mutate()}
                  isRetrying={regenerate.isPending}
                />
              ) : (
                <RecommendationsLoading />
              )}
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

// Shown while the worker is still generating (status pending/processing).
// Polling in the parent flips this to the real cards once it's done.
function RecommendationsLoading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <Loader2 className="size-4 animate-spin text-blue-500" />
        Sedang menyusun rekomendasi use case untukmu...
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-dashboard-border bg-card-2 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 size-6 shrink-0 rounded-full bg-gray-200 dark:bg-dashboard-border" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <div className="h-5 w-40 rounded-full bg-gray-200 dark:bg-dashboard-border" />
                <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-dashboard-border" />
              </div>
              <div className="mt-3 h-4 w-2/3 rounded bg-gray-200 dark:bg-dashboard-border" />
              <div className="mt-2 h-3 w-full rounded bg-gray-200 dark:bg-dashboard-border" />
              <div className="mt-1.5 h-3 w-4/5 rounded bg-gray-200 dark:bg-dashboard-border" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Shown when generation failed — offers a one-click retry that re-queues the
// worker (create.regeneratePreAssessmentReport) and resumes polling.
function RecommendationsFailed({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="size-4 shrink-0" />
        Rekomendasi use case gagal dibuat.
      </div>
      <p className="text-sm leading-6">
        Skill mapping di atas tetap valid. Rekomendasi personalmu belum sempat
        tersusun — coba buat ulang sebentar lagi.
      </p>
      <ButtonAILN variant="neutral" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {isRetrying ? "Memproses..." : "Coba generate ulang"}
      </ButtonAILN>
    </div>
  );
}

function RecommendationCard({
  no,
  item,
}: {
  no: number;
  item: PreAssessmentRecommendation;
}) {
  return (
    <article className="rounded-lg border border-dashboard-border bg-card-2 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
          {no}
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
