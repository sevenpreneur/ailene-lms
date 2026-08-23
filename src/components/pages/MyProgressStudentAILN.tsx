"use client";
import CompetencyProfileAILN from "@/components/charts/CompetencyProfileAILN";
import LevelProgressCardAILN from "@/components/charts/LevelProgressCardAILN";
import StreakCardAILN from "@/components/charts/StreakCardAILN";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import LeaderboardPanelStudentAILN from "@/components/indexes/LeaderboardPanelStudentAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { CheckSession } from "@/lib/actions";
import { setSessionToken, trpc } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
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

  const userQ = useQuery({ queryKey: ["session"], queryFn: CheckSession });
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
        <PreAssessmentReportGateway />
        <LevelProgressCardAILN />

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
      className="ailn-card group flex items-center justify-between gap-4 border bg-gray-950 p-5 transition dark:bg-card-1"
    >
      <span className="flex min-w-0 items-center gap-4">
        <ClipboardCheck className="size-7 shrink-0 text-white" />
        <span className="min-w-0">
          <span className="block text-base font-bold text-white">
            Laporan Pre-Assessment
          </span>
          <span className="mt-1 block text-sm text-gray-300 dark:text-gray-400">
            Lihat ringkasan kompetensi dan rekomendasi use case AI kamu.
          </span>
        </span>
      </span>
      <ButtonAILN variant="light" size="medium" className="shrink-0">
        Lihat Selengkapnya
        <ArrowRight className="size-4" />
      </ButtonAILN>
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
