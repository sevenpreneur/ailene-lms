import {
  getStudentChapters,
  getStudentLevels,
  getStudentStatus,
} from "@/apis/student";
import LearningPathStudentAILN from "@/components/pages/LearningPathStudentAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student",
};

export default async function LearningPathPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [levels, chapters, status] = await Promise.all([
    getStudentLevels(project_id),
    getStudentChapters(project_id),
    getStudentStatus(project_id),
  ]);

  return (
    <LearningPathStudentAILN
      levels={levels}
      chapters={chapters}
      currentLevelNumber={status?.current_level_number ?? 0}
      totalXp={status?.xp_count ?? 0}
    />
  );
}
