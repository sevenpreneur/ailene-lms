import { getQuizDetails } from "@/apis/learnings";
import QuizAttemptAILN from "@/components/pages/QuizAttemptAILN";
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

  const quiz = await getQuizDetails(quizId);
  if (!quiz) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  return (
    <QuizAttemptAILN
      data={{
        quiz: {
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          chapter: quiz.chapter,
        },
        questions: quiz.questions,
      }}
    />
  );
}
