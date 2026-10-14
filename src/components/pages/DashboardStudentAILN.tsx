"use client";
import TodayFocusCardAILN from "@/components/cards/TodayFocusCardAILN";
import AchievementsCardAILN from "@/components/charts/AchievementsCardAILN";
import CompetencyProfileAILN from "@/components/charts/CompetencyProfileAILN";
import AnnouncementTickerAILN from "@/components/indexes/AnnouncementTickerAILN";
import CoachingNotesAILN from "@/components/indexes/CoachingNotesAILN";
import StudentHeaderAILN from "@/components/navigations/StudentHeaderAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import type { Announcement } from "@/apis/announcement";
import type { CoachingNote } from "@/apis/coaching-notes";
import type { StudentCompetency, StudentLevelProgress } from "@/apis/student";
import type { TodayFocus } from "@/apis/learnings";

export default function DashboardStudentAILN({
  fullName,
  projectId,
  currentLevelNumber,
  totalXp,
  levelProgress,
  competency,
  announcement,
  todayFocus,
  coachingNotes,
}: {
  fullName: string;
  projectId: string;
  currentLevelNumber: number;
  totalXp: number;
  levelProgress: StudentLevelProgress | null;
  competency: StudentCompetency | null;
  announcement: Announcement | null;
  todayFocus: TodayFocus | null;
  coachingNotes: CoachingNote[];
}) {
  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <StudentHeaderAILN
          fullName={fullName}
          projectId={projectId}
          currentLevelNumber={currentLevelNumber}
          totalXp={totalXp}
        />
        <AnnouncementTickerAILN announcement={announcement} />
        <TodayFocusCardAILN focus={todayFocus} />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <CompetencyProfileAILN
            dimensions={competency?.dimensions ?? []}
            currentLevelNumber={competency?.current_level_number ?? 0}
            className="h-full"
          />
          <AchievementsCardAILN
            totalXp={levelProgress?.total_xp ?? totalXp}
            currentLevelNumber={
              levelProgress?.current_level_number ?? currentLevelNumber
            }
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
