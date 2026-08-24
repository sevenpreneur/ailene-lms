"use client";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import QuizAttemptAILN, {
  type QuizDetailsData,
} from "@/components/pages/QuizAttemptAILN";
import QuizResultAILN from "@/components/pages/QuizResultAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { getQuizQuestionsMock } from "@/mock-data/student";

interface QuizDetailsAILNProps {
  quizId: string;
}

export default function QuizDetailsAILN({ quizId }: QuizDetailsAILNProps) {
  const data = getQuizQuestionsMock({ quiz_id: quizId });
  const d = data as unknown as QuizDetailsData | null;

  if (!d?.quiz) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  if (d.progress) {
    return <QuizResultAILN quizId={quizId} />;
  }
  return <QuizAttemptAILN quizId={quizId} data={d} />;
}
