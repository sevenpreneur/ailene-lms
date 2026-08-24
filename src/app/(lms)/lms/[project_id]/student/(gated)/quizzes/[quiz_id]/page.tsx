import QuizDetailsAILN from "@/components/pages/QuizDetailsAILN";
import AppPageState from "@/components/states/AppPageState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz",
};

export default async function QuizPage({
  params,
}: {
  params: Promise<{ project_id: string; quiz_id: string }>;
}) {
  const { quiz_id: quizId } = await params;

  if (!quizId) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  return <QuizDetailsAILN quizId={quizId} />;
}
