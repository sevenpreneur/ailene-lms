import { getChapters } from "@/apis/chapters";
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
  const [chapters, levelProgress, competency, leaderboard] = await Promise.all([
    getChapters(project_id),
    getStudentLevelProgress(project_id),
    getStudentCompetency(project_id),
    getStudentLeaderboard(project_id),
  ]);
  const levels = Array.from(
    new Map(
      chapters.map((chapter) => [
        chapter.level_id,
        {
          id: chapter.level_id,
          level_number: chapter.level_number,
          name: chapter.level_name,
        },
      ]),
    ).values(),
  ).sort((a, b) => a.level_number - b.level_number);

  return (
    <MyProgressStudentAILN
      levels={levels}
      levelProgress={levelProgress}
      competency={competency}
      leaderboard={leaderboard}
    />
  );
}
