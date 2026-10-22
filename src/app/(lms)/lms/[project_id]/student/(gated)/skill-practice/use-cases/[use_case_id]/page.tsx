import { captureApiRead } from "@/apis/api";
import {
  getAssignedUseCases,
  getGuidedSession,
  getUseCaseDetails,
} from "@/apis/use-cases";
import GuidedUseCaseStudentAILN from "@/components/pages/GuidedUseCaseStudentAILN";
import AppPageState from "@/components/states/AppPageState";
import LoadErrorAILN from "@/components/states/LoadErrorAILN";
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
    captureApiRead(getAssignedUseCases(project_id)),
  ]);
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }
  if (!guided.success) {
    return <LoadErrorAILN message="Use Case belum dapat dimuat." />;
  }

  // Only guided assignments are available in the student LMS for now.
  if (guided.data) {
    const assignment = assigned.data?.find((item) => item.id === useCaseIdNum);
    return (
      <GuidedUseCaseStudentAILN
        useCase={result.data}
        session={guided.data}
        championName={assignment?.assigned_by?.name ?? null}
      />
    );
  }

  return <AppPageState variant="NOT_FOUND" />;
}
