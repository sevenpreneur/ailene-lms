import ReviewUseCaseAILN from "@/components/forms/ReviewUseCaseAILN";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Review Use Case",
};

export default async function ChampionUseCaseSubmissionPage({
  params,
}: {
  params: Promise<{ submission_id: string }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  const { submission_id } = await params;
  const submissionId = Number(submission_id);

  return (
    <ReviewUseCaseAILN
      sessionToken={sessionToken}
      submissionId={submissionId}
    />
  );
}
