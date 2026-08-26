"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import FirstWinCardAILN from "@/components/cards/FirstWinCardAILN";
import TodayFocusCardAILN from "@/components/cards/TodayFocusCardAILN";
import CompetencyProfileAILN from "@/components/charts/CompetencyProfileAILN";
import StreakCardAILN from "@/components/charts/StreakCardAILN";
import AnnouncementTickerAILN from "@/components/indexes/AnnouncementTickerAILN";
import CoachingNotesAILN from "@/components/indexes/CoachingNotesAILN";
import RecommendationsAILN from "@/components/indexes/RecommendationsAILN";
import LevelLabelStudentAILN from "@/components/labels/LevelLabelStudentAILN";
import RewardLabelStudentAILN from "@/components/labels/RewardLabelStudentAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { CheckSession } from "@/lib/actions";
import { useProjectId } from "@/lib/use-project-id";
import { getAilMemberMock } from "@/mock-data/shared";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardStudentAILN({
  currentLevelNumber,
  totalXp,
}: {
  currentLevelNumber: number;
  totalXp: number;
}) {
  const projectId = useProjectId();

  const userQ = useQuery({ queryKey: ["session"], queryFn: CheckSession });

  if (userQ.isError) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const user = userQ.data?.user;
  const member = getAilMemberMock({ projectId, userId: user?.id ?? "current" });
  const firstName = user
    ? (user.full_name.split(" ")[0] ?? user.full_name)
    : null;
  // Rentang streak = sejak member bergabung sampai hari ini.
  const cohortStart = dayjs(member.created_at).format("YYYY-MM-DD");
  const cohortEnd = dayjs().format("YYYY-MM-DD");

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <header className="sticky top-0 z-30 -mx-4 -mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-dashboard-border bg-background/80 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6 xl:-mx-8 xl:px-8">
          <h1 className="display-font text-xl font-bold tracking-tight text-foreground dark:text-white">
            {firstName ? (
              `Halo, ${firstName}.`
            ) : (
              <span className="inline-flex items-center gap-2">
                Halo,
                <span className="inline-block h-5 w-28 animate-pulse rounded bg-gray-200 dark:bg-dashboard-border" />
              </span>
            )}
          </h1>

          <div className="flex items-center gap-3">
            <LevelLabelStudentAILN
              variant="compact"
              levelNumber={currentLevelNumber}
            />
            <RewardLabelStudentAILN variant="compact" xp={totalXp} />

            <Link href={`/${projectId}/student/skill-practice/create`}>
              <ButtonAILN variant="lime" size="medium">
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
        <CoachingNotesAILN />
      </div>
    </PageContainerAILN>
  );
}
