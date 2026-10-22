"use client";
import LoadErrorAILN from "@/components/states/LoadErrorAILN";
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
  failedSections = [],
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
  failedSections?: string[];
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
        {failedSections.includes("status") ? (
          <LoadErrorAILN message="Level dan XP belum dapat dimuat." />
        ) : (
          <StudentHeaderAILN
            fullName={fullName}
            projectId={projectId}
            currentLevelNumber={currentLevelNumber}
            totalXp={totalXp}
          />
        )}
        {failedSections.includes("announcement") ? (
          <LoadErrorAILN message="Pengumuman belum dapat dimuat." />
        ) : (
          <AnnouncementTickerAILN announcement={announcement} />
        )}
        {failedSections.includes("todayFocus") ? (
          <LoadErrorAILN message="Tugas berikutnya belum dapat dimuat. Status penyelesaian belum diketahui." />
        ) : (
          <TodayFocusCardAILN focus={todayFocus} />
        )}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {failedSections.includes("competency") ? (
            <LoadErrorAILN message="Profil kompetensi belum dapat dimuat." />
          ) : (
            <CompetencyProfileAILN
              dimensions={competency?.dimensions ?? []}
              currentLevelNumber={competency?.current_level_number ?? 0}
              className="h-full"
            />
          )}
          {failedSections.includes("levelProgress") ? (
            <LoadErrorAILN message="Capaian belajar belum dapat dimuat." />
          ) : (
            <AchievementsCardAILN
              totalXp={levelProgress?.total_xp ?? totalXp}
              currentLevelNumber={
                levelProgress?.current_level_number ?? currentLevelNumber
              }
              currentLevelName={levelProgress?.current_level_name ?? null}
              useCaseApprovedCount={levelProgress?.use_case_approved_count ?? 0}
              hoursSavedTotal={levelProgress?.hours_saved_total ?? 0}
              toolsMastered={levelProgress?.tools_mastered ?? []}
              className="h-full"
            />
          )}
        </div>
        {failedSections.includes("coachingNotes") ? (
          <LoadErrorAILN message="Catatan coaching belum dapat dimuat." />
        ) : (
          <CoachingNotesAILN notes={coachingNotes} />
        )}
      </div>
    </PageContainerAILN>
  );
}
