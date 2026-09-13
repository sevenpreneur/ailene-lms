"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import FirstWinCardAILN from "@/components/cards/FirstWinCardAILN";
import TodayFocusCardAILN from "@/components/cards/TodayFocusCardAILN";
import AchievementsCardAILN from "@/components/charts/AchievementsCardAILN";
import CompetencyProfileAILN from "@/components/charts/CompetencyProfileAILN";
import AnnouncementTickerAILN from "@/components/indexes/AnnouncementTickerAILN";
import CoachingNotesAILN from "@/components/indexes/CoachingNotesAILN";
import LevelLabelStudentAILN from "@/components/labels/LevelLabelStudentAILN";
import RewardLabelStudentAILN from "@/components/labels/RewardLabelStudentAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import type { Announcement } from "@/apis/announcement";
import type { CoachingNote } from "@/apis/coaching-notes";
import type {
  StudentCompetency,
  StudentLevelProgress,
} from "@/apis/student";
import type { TodayFocus } from "@/apis/learnings";
import { CheckSession } from "@/lib/actions";
import { useProjectId } from "@/lib/use-project-id";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardStudentAILN({
  currentLevelNumber,
  totalXp,
  levelProgress,
  competency,
  announcement,
  todayFocus,
  coachingNotes,
}: {
  currentLevelNumber: number;
  totalXp: number;
  levelProgress: StudentLevelProgress | null;
  competency: StudentCompetency | null;
  announcement: Announcement | null;
  todayFocus: TodayFocus | null;
  coachingNotes: CoachingNote[];
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
  const firstName = user
    ? (user.full_name.split(" ")[0] ?? user.full_name)
    : null;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <header className="sticky top-14 z-30 -mx-4 -mt-6 flex flex-wrap items-center justify-between gap-3 border-b lg:top-0 border-dashboard-border bg-background/80 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6 xl:-mx-8 xl:px-8">
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

        <AnnouncementTickerAILN announcement={announcement} />
        <FirstWinCardAILN />
        <TodayFocusCardAILN focus={todayFocus} />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <CompetencyProfileAILN
            dimensions={competency?.dimensions ?? []}
            currentLevelNumber={competency?.current_level_number ?? 0}
            className="h-full"
          />
          <AchievementsCardAILN
            totalXp={levelProgress?.total_xp ?? totalXp}
            currentLevelNumber={levelProgress?.current_level_number ?? currentLevelNumber}
            currentLevelName={levelProgress?.current_level_name ?? null}
            useCaseApprovedCount={levelProgress?.use_case_approved_count ?? 0}
            promptApprovedCount={levelProgress?.prompt_approved_count ?? 0}
            hoursSavedTotal={levelProgress?.hours_saved_total ?? 0}
            toolsMastered={levelProgress?.tools_mastered ?? []}
            className="h-full"
          />
        </div>
        <CoachingNotesAILN notes={coachingNotes} />
      </div>
    </PageContainerAILN>
  );
}
