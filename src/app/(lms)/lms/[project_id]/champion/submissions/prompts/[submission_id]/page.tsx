import { getPromptSubmissionDetails } from "@/apis/champion";
import ReviewPromptAILN from "@/components/forms/ReviewPromptAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Prompt",
};

export default async function ChampionPromptSubmissionPage({
  params,
}: {
  params: Promise<{ project_id: string; submission_id: string }>;
}) {
  const { project_id, submission_id } = await params;
  const submissionId = Number(submission_id);

  const detail = Number.isInteger(submissionId)
    ? await getPromptSubmissionDetails(project_id, submissionId)
    : null;

  return <ReviewPromptAILN detail={detail} />;
}
