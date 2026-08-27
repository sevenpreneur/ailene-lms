import { getAnnouncementDetails } from "@/apis/announcement";
import {
  getStudentCompetency,
  getStudentLevelProgress,
  getStudentStatus,
} from "@/apis/student";
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
  const [status, levelProgress, competency, announcement] = await Promise.all([
    getStudentStatus(project_id),
    getStudentLevelProgress(project_id),
    getStudentCompetency(project_id),
    getAnnouncementDetails(project_id),
  ]);

  return (
    <DashboardStudentAILN
      currentLevelNumber={status?.current_level_number ?? 0}
      totalXp={status?.xp_count ?? 0}
      levelProgress={levelProgress}
      competency={competency}
      announcement={announcement}
    />
  );
}
