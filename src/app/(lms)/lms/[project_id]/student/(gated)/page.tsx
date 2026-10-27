import { captureApiRead } from "@/apis/api";
import { getAnnouncementDetails } from "@/apis/announcement";
import { checkSession } from "@/apis/auth";
import { getChapterTasks } from "@/apis/chapter-tasks";
import { getChapters } from "@/apis/chapters";
import { getCoachingNotes } from "@/apis/coaching-notes";
import { getStudentStatus, getTodayFocus } from "@/apis/student";
import DashboardStudentAILN from "@/components/pages/DashboardStudentAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student",
};

export default async function StudentPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [
    session,
    status,
    announcement,
    todayFocus,
    chapterTasks,
    chapters,
    coachingNotes,
  ] = await Promise.all([
      checkSession(),
      captureApiRead(getStudentStatus(project_id)),
      captureApiRead(getAnnouncementDetails(project_id)),
      captureApiRead(getTodayFocus(project_id)),
      captureApiRead(getChapterTasks({ projectId: project_id })),
      captureApiRead(getChapters(project_id)),
      captureApiRead(getCoachingNotes(project_id, "student")),
    ]);

  return (
    <DashboardStudentAILN
      failedSections={[
        status.failed ? "status" : "",
        announcement.failed ? "announcement" : "",
        todayFocus.failed ? "todayFocus" : "",
        chapterTasks.failed ? "chapterTasks" : "",
        coachingNotes.failed ? "coachingNotes" : "",
      ].filter(Boolean)}
      fullName={session?.user.full_name ?? "teman"}
      projectId={project_id}
      currentLevelNumber={status.data?.current_level_number ?? 0}
      totalXp={status.data?.xp_count ?? 0}
      announcement={announcement.data}
      todayFocus={todayFocus.data}
      chapterTasks={chapterTasks.data ?? []}
      chapterOrder={(chapters.data ?? []).map((chapter) => chapter.id)}
      coachingNotes={coachingNotes.data ?? []}
    />
  );
}
