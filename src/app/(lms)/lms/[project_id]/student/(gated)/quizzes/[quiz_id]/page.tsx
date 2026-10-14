import {
  getQuizDetails,
  getQuizResult,
  startQuizAttempt,
} from "@/apis/learnings";
import QuizAttemptAILN from "@/components/pages/QuizAttemptAILN";
import QuizResultAILN from "@/components/pages/QuizResultAILN";
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
          result.reason === "chapter_locked"
            ? "Chapter ini belum terbuka. Periksa jadwal sesi atau hubungi admin."
            : "Kamu belum memiliki akses untuk mengerjakan quiz ini."
        }
      />
    );
  }
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const quiz = result.data;

  if (quiz.attempts > 0) {
    const quizResult = await getQuizResult(quizId);
    if (!quizResult) {
      return <AppPageState variant="NOT_FOUND" />;
    }
    return <QuizResultAILN result={quizResult} />;
  }

  const attempt = await startQuizAttempt(quizId);
  if (!attempt) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  if (attempt.status === "finalized") {
    const quizResult = await getQuizResult(quizId);
    if (!quizResult) {
      return <AppPageState variant="NOT_FOUND" />;
    }
    return <QuizResultAILN result={quizResult} />;
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
      initialAnswers={attempt.answers ?? {}}
      initialSecondsLeft={attempt.seconds_left ?? 20 * 60}
    />
  );
}
