import {
  getAssignedUseCases,
  getGuidedSession,
  getUseCaseDetails,
} from "@/apis/use-cases";
import SubmitUseCaseAILN from "@/components/forms/SubmitUseCaseAILN";
import GuidedUseCaseStudentAILN from "@/components/pages/GuidedUseCaseStudentAILN";
import AppPageState from "@/components/states/AppPageState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerjakan Use Case",
};

export default async function StudentUseCasePracticePage({
  params,
}: {
  params: Promise<{ project_id: string; use_case_id: string }>;
}) {
  const { project_id, use_case_id } = await params;
  const useCaseIdNum = Number(use_case_id);

  if (!Number.isInteger(useCaseIdNum) || useCaseIdNum <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const [result, guided, assigned] = await Promise.all([
    getUseCaseDetails(useCaseIdNum),
    getGuidedSession({ use_case_id: useCaseIdNum, project_id }),
    getAssignedUseCases(project_id),
  ]);
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }

  // A champion-prepared guided use case carries a session; everything else keeps the classic form.
  if (guided.success && guided.data) {
    const assignment = assigned.find((item) => item.id === useCaseIdNum);
    return (
      <GuidedUseCaseStudentAILN
        useCase={result.data}
        session={guided.data}
        championName={assignment?.assigned_by?.name ?? null}
      />
    );
  }

  return <SubmitUseCaseAILN useCase={result.data} />;
}
