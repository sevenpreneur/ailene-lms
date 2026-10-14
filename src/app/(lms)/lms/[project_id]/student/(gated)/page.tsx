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
  const [session, status, levelProgress, competency, announcement, todayFocus, coachingNotes] =
    await Promise.all([
      checkSession(),
      getStudentStatus(project_id),
      getStudentLevelProgress(project_id),
      getStudentCompetency(project_id),
      getAnnouncementDetails(project_id),
      getTodayFocus(project_id),
      getCoachingNotes(project_id, "student"),
    ]);

  return (
    <DashboardStudentAILN
      fullName={session?.user.full_name ?? "teman"}
      projectId={project_id}
      currentLevelNumber={status?.current_level_number ?? 0}
      totalXp={status?.xp_count ?? 0}
      levelProgress={levelProgress}
      competency={competency}
      announcement={announcement}
      todayFocus={todayFocus}
      coachingNotes={coachingNotes}
    />
  );
}
