"use client";
import CompetencyProfileAILN from "@/components/charts/CompetencyProfileAILN";
import LevelProgressCardAILN from "@/components/charts/LevelProgressCardAILN";
import StreakCardAILN from "@/components/charts/StreakCardAILN";
import LeaderboardPanelStudentAILN from "@/components/indexes/LeaderboardPanelStudentAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

dayjs.locale("id");

export default function MyProgressStudentAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const userQ = trpc.auth.checkSession.useQuery();
  const memberQ = trpc.auth.checkAilMember.useQuery();

  if (userQ.isLoading || memberQ.isLoading) {
    return (
      <PageContainerAILN>
        <ProgressSkeleton />
      </PageContainerAILN>
    );
  }
  if (
    userQ.error ||
    memberQ.error ||
    !userQ.data?.user ||
    !memberQ.data?.ail_member
  ) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const member = memberQ.data.ail_member;
  // Rentang streak = sejak member bergabung sampai hari ini (bukan hardcoded).
  const cohortStart = dayjs(member.created_at).format("YYYY-MM-DD");
  const cohortEnd = dayjs().format("YYYY-MM-DD");

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-5">
        <PageHeaderAILN
          title="Progress Belajar AI"
          desc="Pantau perkembangan level, kompetensi, streak, dan kontribusi XP dalam satu tempat."
        />

        {/* Level journey — full width */}
        <LevelProgressCardAILN />
        <PreAssessmentReportGateway />

        {/* Profil Kompetensi 60% sejajar Capaian Kamu / streak 40% (tinggi sama) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <CompetencyProfileAILN className="h-full" />
          <StreakCardAILN
            startDate={cohortStart}
            endDate={cohortEnd}
            className="h-full"
          />
        </div>

        {/* Leaderboard — full width */}
        <LeaderboardPanelStudentAILN />
      </div>
    </PageContainerAILN>
  );
}

function PreAssessmentReportGateway() {
  return (
    <Link
      href="/student/my-progress/pre-assessment-report"
      className="ailn-card group flex items-center justify-between gap-4 border border-red-100 bg-gradient-to-br from-red-50 via-white to-rose-50/60 p-5 transition dark:border-red-500/25 dark:from-red-500/10 dark:via-card-1 dark:to-rose-500/10"
    >
      <span className="flex min-w-0 items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
          <ClipboardCheck className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-bold text-foreground">
            Laporan Pre-Assessment
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Lihat ringkasan kompetensi dan rekomendasi use case AI kamu.
          </span>
        </span>
      </span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-red-100 bg-white/70 text-red-500 transition group-hover:translate-x-0.5 dark:border-red-500/20 dark:bg-card-1/60 dark:text-red-400">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

function ProgressSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-gray-200 dark:bg-dashboard-border" />
          <div className="h-7 w-64 rounded bg-gray-200 dark:bg-dashboard-border" />
          <div className="h-3 w-80 rounded bg-gray-200 dark:bg-dashboard-border" />
        </div>
        <div className="h-16 w-40 rounded-md bg-gray-200 dark:bg-dashboard-border" />
      </div>
      <div className="h-48 rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1"
          />
        ))}
      </div>
      <div className="h-72 rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1" />
    </div>
  );
}
