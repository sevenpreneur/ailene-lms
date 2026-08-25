import {
  getStudentChapters,
  getStudentLevels,
  getStudentStatus,
} from "@/apis/student";
import { getAssignedPrompts, getPrompts } from "@/apis/prompts";
import { getAssignedUseCases, getUseCases } from "@/apis/use-cases";
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
  const [
    levels,
    chapters,
    status,
    assignedPrompts,
    assignedUseCases,
    promptLibrary,
    useCaseLibrary,
  ] = await Promise.all([
    getStudentLevels(project_id),
    getStudentChapters(project_id),
    getStudentStatus(project_id),
    getAssignedPrompts(project_id),
    getAssignedUseCases(project_id),
    getPrompts(project_id, { page_size: 100 }),
    getUseCases(project_id, { page_size: 100 }),
  ]);

  // Assigned endpoints omit level_number — recover it from the library list (same item id).
  const promptLevelById = new Map(
    promptLibrary.list.map((p) => [p.id, p.level_number])
  );
  const useCaseLevelById = new Map(
    useCaseLibrary.list.map((u) => [u.id, u.level_number])
  );

  return (
    <LearningPathStudentAILN
      levels={levels}
      chapters={chapters}
      currentLevelNumber={status?.current_level_number ?? 0}
      totalXp={status?.xp_count ?? 0}
      assignedPrompts={assignedPrompts}
      assignedUseCases={assignedUseCases}
      promptLevelById={Object.fromEntries(promptLevelById)}
      useCaseLevelById={Object.fromEntries(useCaseLevelById)}
    />
  );
}
