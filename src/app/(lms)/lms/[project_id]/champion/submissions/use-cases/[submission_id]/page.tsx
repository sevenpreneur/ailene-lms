import { getUseCaseSubmissionDetails } from "@/apis/champion";
import ReviewUseCaseAILN from "@/components/forms/ReviewUseCaseAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Use Case",
};

export default async function ChampionUseCaseSubmissionPage({
  params,
}: {
  params: Promise<{ project_id: string; submission_id: string }>;
}) {
  const { project_id, submission_id } = await params;
  const submissionId = Number(submission_id);

  const detail = Number.isInteger(submissionId)
    ? await getUseCaseSubmissionDetails(project_id, submissionId)
    : null;

  return <ReviewUseCaseAILN detail={detail} />;
}
