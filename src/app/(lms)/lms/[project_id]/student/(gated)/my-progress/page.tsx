import { getStudentLevels } from "@/apis/learnings";
import {
  getStudentCompetency,
  getStudentLeaderboard,
  getStudentLevelProgress,
} from "@/apis/student";
import MyProgressStudentAILN from "@/components/pages/MyProgressStudentAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress Saya",
};

export default async function StudentMyProgressPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [levels, levelProgress, competency, leaderboard] = await Promise.all([
    getStudentLevels(project_id),
    getStudentLevelProgress(project_id),
    getStudentCompetency(project_id),
    getStudentLeaderboard(project_id),
  ]);

  return (
    <MyProgressStudentAILN
      levels={levels}
      levelProgress={levelProgress}
      competency={competency}
      leaderboard={leaderboard}
    />
  );
}
