"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import DashboardStudentSkeletonAILN from "@/components/cards/DashboardStudentSkeletonAILN";
import FirstWinCardAILN from "@/components/cards/FirstWinCardAILN";
import TodayFocusCardAILN from "@/components/cards/TodayFocusCardAILN";
import CompetencyProfileAILN from "@/components/charts/CompetencyProfileAILN";
import StreakCardAILN from "@/components/charts/StreakCardAILN";
import AnnouncementTickerAILN from "@/components/indexes/AnnouncementTickerAILN";
import RecommendationsAILN from "@/components/indexes/RecommendationsAILN";
import MemberStatsLabelAILN from "@/components/labels/MemberStatsLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardStudentAILN({
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
        <DashboardStudentSkeletonAILN />
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

  const user = userQ.data.user;
  const member = memberQ.data.ail_member;
  const firstName = user.full_name.split(" ")[0] ?? user.full_name;
  // Rentang streak = sejak member bergabung sampai hari ini.
  const cohortStart = dayjs(member.created_at).format("YYYY-MM-DD");
  const cohortEnd = dayjs().format("YYYY-MM-DD");

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <header className="sticky top-0 z-30 -mx-4 -mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-dashboard-border bg-background/80 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6 xl:-mx-8 xl:px-8">
          <h1 className="display-font text-xl font-bold tracking-tight text-foreground dark:text-white">
            Halo, {firstName}.
          </h1>

          <div className="flex items-center gap-3">
            <MemberStatsLabelAILN />

            {/* Catat Use Case — CTA merah (ButtonAILN dibungkus Link) */}
            <Link href="/student/practice/create">
              <ButtonAILN variant="destructive" size="medium">
                <PlusCircle className="size-4" />
                Catat Use Case
              </ButtonAILN>
            </Link>
          </div>
        </header>

        <AnnouncementTickerAILN />
        <FirstWinCardAILN />
        <TodayFocusCardAILN />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <CompetencyProfileAILN className="h-full" />
          <StreakCardAILN
            startDate={cohortStart}
            endDate={cohortEnd}
            className="h-full"
          />
        </div>
        <RecommendationsAILN />
      </div>
    </PageContainerAILN>
  );
}
