import { getAssignedUseCases, getUseCases } from "@/apis/use-cases";
import SkillPracticeStudentAILN from "@/components/pages/SkillPracticeStudentAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use Case",
};

export default async function StudentPracticePage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [useCaseLibrary, assignedUseCases] = await Promise.all([
    getUseCases(project_id, { page_size: 100 }),
    getAssignedUseCases(project_id),
  ]);

  return (
    <SkillPracticeStudentAILN
      useCaseLibrary={useCaseLibrary.list}
      assignedUseCases={assignedUseCases}
    />
  );
}
