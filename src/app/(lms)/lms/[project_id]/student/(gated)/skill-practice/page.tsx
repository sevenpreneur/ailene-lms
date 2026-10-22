import { captureApiRead } from "@/apis/api";
import { getAssignedUseCases, getGuidedSession } from "@/apis/use-cases";
import SkillPracticeStudentAILN from "@/components/pages/SkillPracticeStudentAILN";
import { Metadata } from "next";
export const metadata: Metadata = { title: "Latihan AI" };
export default async function StudentPracticePage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [assignedUseCases, personal] = await Promise.all([
    captureApiRead(getAssignedUseCases(project_id)),
    getGuidedSession({ project_id }),
  ]);
  const guidedChecks = await Promise.all(
    (assignedUseCases.data ?? []).map((item) =>
      getGuidedSession({ use_case_id: item.id, project_id }),
    ),
  );
  const guidedOnly = (assignedUseCases.data ?? []).filter(
    (_, index) => guidedChecks[index]?.success && guidedChecks[index]?.data,
  );
  return (
    <SkillPracticeStudentAILN
      assignedUseCases={guidedOnly}
      personalSession={
        personal.success &&
        personal.data &&
        (personal.data.current_step >= 4 || personal.data.steps.length > 0)
          ? personal.data
          : null
      }
      personalFailed={!personal.success}
      assignedFailed={
        assignedUseCases.failed ||
        (guidedChecks.length > 0 && guidedChecks.every((item) => !item.success))
      }
    />
  );
}
