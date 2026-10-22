import { captureApiRead } from "@/apis/api";
import { getAnnouncementDetails } from "@/apis/announcement";
import { checkSession } from "@/apis/auth";
import { getCoachingNotes } from "@/apis/coaching-notes";
import {
  getStudentCompetency,
  getStudentLevelProgress,
  getStudentStatus,
} from "@/apis/student";
import { getTodayFocus } from "@/apis/learnings";
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
    levelProgress,
    competency,
    announcement,
    todayFocus,
    coachingNotes,
  ] = await Promise.all([
    checkSession(),
    captureApiRead(getStudentStatus(project_id)),
    captureApiRead(getStudentLevelProgress(project_id)),
    captureApiRead(getStudentCompetency(project_id)),
    captureApiRead(getAnnouncementDetails(project_id)),
    captureApiRead(getTodayFocus(project_id)),
    captureApiRead(getCoachingNotes(project_id, "student")),
  ]);

  return (
    <DashboardStudentAILN
      failedSections={[
        status.failed ? "status" : "",
        levelProgress.failed ? "levelProgress" : "",
        competency.failed ? "competency" : "",
        announcement.failed ? "announcement" : "",
        todayFocus.failed ? "todayFocus" : "",
        coachingNotes.failed ? "coachingNotes" : "",
      ].filter(Boolean)}
      fullName={session?.user.full_name ?? "teman"}
      projectId={project_id}
      currentLevelNumber={status.data?.current_level_number ?? 0}
      totalXp={status.data?.xp_count ?? 0}
      levelProgress={levelProgress.data}
      competency={competency.data}
      announcement={announcement.data}
      todayFocus={todayFocus.data}
      coachingNotes={coachingNotes.data ?? []}
    />
  );
}
