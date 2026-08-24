import ReviewPromptAILN from "@/components/forms/ReviewPromptAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Prompt",
};

export default async function ChampionPromptSubmissionPage({
  params,
}: {
  params: Promise<{ submission_id: string }>;
}) {
  const { submission_id } = await params;
  const submissionId = Number(submission_id);

  return <ReviewPromptAILN submissionId={submissionId} />;
}
