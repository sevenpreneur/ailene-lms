import { getAssignedPrompts, getPrompts } from "@/apis/prompts";
import { getAssignedUseCases, getUseCases } from "@/apis/use-cases";
import SkillPracticeStudentAILN from "@/components/pages/SkillPracticeStudentAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tugas",
};

export default async function StudentPracticePage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [promptLibrary, useCaseLibrary, assignedPrompts, assignedUseCases] =
    await Promise.all([
      getPrompts(project_id, { page_size: 100 }),
      getUseCases(project_id, { page_size: 100 }),
      getAssignedPrompts(project_id),
      getAssignedUseCases(project_id),
    ]);

  return (
    <SkillPracticeStudentAILN
      promptLibrary={promptLibrary.list}
      useCaseLibrary={useCaseLibrary.list}
      assignedPrompts={assignedPrompts}
      assignedUseCases={assignedUseCases}
    />
  );
}
