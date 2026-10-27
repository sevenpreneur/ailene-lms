"use client";
import LoadErrorAILN from "@/components/states/LoadErrorAILN";
import TodayFocusCardAILN from "@/components/cards/TodayFocusCardAILN";
import AnnouncementTickerAILN from "@/components/indexes/AnnouncementTickerAILN";
import ChapterTasksStudentAILN from "@/components/indexes/ChapterTasksStudentAILN";
import CoachingNotesAILN from "@/components/indexes/CoachingNotesAILN";
import StudentHeaderAILN from "@/components/navigations/StudentHeaderAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import type { Announcement } from "@/apis/announcement";
import type { ChapterTask } from "@/apis/chapter-tasks";
import type { CoachingNote } from "@/apis/coaching-notes";
import type { TodayFocus } from "@/apis/student";

export default function DashboardStudentAILN({
  failedSections = [],
  fullName,
  projectId,
  currentLevelNumber,
  totalXp,
  announcement,
  todayFocus,
  chapterTasks,
  chapterOrder,
  coachingNotes,
}: {
  failedSections?: string[];
  fullName: string;
  projectId: string;
  currentLevelNumber: number;
  totalXp: number;
  announcement: Announcement | null;
  todayFocus: TodayFocus | null;
  chapterTasks: ChapterTask[];
  chapterOrder: number[];
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
        {failedSections.includes("chapterTasks") ? (
          <LoadErrorAILN message="Tugas praktik belum dapat dimuat." />
        ) : (
          <ChapterTasksStudentAILN tasks={chapterTasks} chapterOrder={chapterOrder} />
        )}
        {failedSections.includes("coachingNotes") ? (
          <LoadErrorAILN message="Catatan coaching belum dapat dimuat." />
        ) : (
          <CoachingNotesAILN notes={coachingNotes} />
        )}
      </div>
    </PageContainerAILN>
  );
}
