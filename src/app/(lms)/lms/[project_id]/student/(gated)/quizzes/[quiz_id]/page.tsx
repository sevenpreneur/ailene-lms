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

  const result = await getQuizDetails(quizId);
  if (result.kind === "forbidden") {
    return (
      <AppPageState
        variant="FORBIDDEN"
        message={
          result.reason === "level_locked"
            ? "Quiz ini belum bisa diakses. Selesaikan bagian sebelumnya untuk membukanya."
            : "Kamu belum memiliki akses untuk mengerjakan quiz ini."
        }
      />
    );
  }
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const quiz = result.data;

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
