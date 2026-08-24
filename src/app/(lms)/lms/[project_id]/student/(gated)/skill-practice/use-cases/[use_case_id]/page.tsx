import SubmitUseCaseAILN from "@/components/forms/SubmitUseCaseAILN";
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

  return <SubmitUseCaseAILN useCaseId={useCaseIdNum} />;
}
