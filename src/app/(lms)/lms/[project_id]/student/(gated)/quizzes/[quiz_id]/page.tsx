import QuizDetailsAILN from "@/components/pages/QuizDetailsAILN";
import AppPageState from "@/components/states/AppPageState";
import { getProgramGate } from "@/lib/gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz",
};

export default async function QuizPage({
  params,
}: {
  params: Promise<{ project_id: string; quiz_id: string }>;
}) {
  const { project_id, quiz_id: quizId } = await params;

  const { sessionToken, ailMember } = await getProgramGate(project_id);
  if (!sessionToken) return null;

  if (!quizId) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <QuizDetailsAILN quizId={quizId} />;
}
