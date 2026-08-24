import ReviewUseCaseAILN from "@/components/forms/ReviewUseCaseAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Use Case",
};

export default async function ChampionUseCaseSubmissionPage({
  params,
}: {
  params: Promise<{ submission_id: string }>;
}) {
  const { submission_id } = await params;
  const submissionId = Number(submission_id);

  return <ReviewUseCaseAILN submissionId={submissionId} />;
}
