import { getUseCaseDetails } from "@/apis/use-cases";
import SubmitUseCaseAILN from "@/components/forms/SubmitUseCaseAILN";
import AppPageState from "@/components/states/AppPageState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerjakan Use Case",
};

export default async function StudentUseCasePracticePage({
  params,
}: {
  params: Promise<{ use_case_id: string }>;
}) {
  const { use_case_id } = await params;
  const useCaseIdNum = Number(use_case_id);

  if (!Number.isInteger(useCaseIdNum) || useCaseIdNum <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const result = await getUseCaseDetails(useCaseIdNum);
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }

  return <SubmitUseCaseAILN useCase={result.data} />;
}
