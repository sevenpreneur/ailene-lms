"use client";
import QuizSummaryBannerAILN from "@/components/banners/QuizSummaryBannerAILN";
import QuizAnswerDiscussionItemAILN from "@/components/items/QuizAnswerDiscussionItemAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import AppLoadingComponents from "@/components/states/AppLoadingComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { trpc } from "@/trpc/client";

interface QuizOption {
  id: number;
  option_code: string;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  explanation: string | null;
  order_index: number;
  xp_reward: number;
  options: QuizOption[];
}

interface QuizResultPayload {
  quiz: {
    id: string;
    name: string;
    description: string | null;
    chapter: { id: number; name: string } | null;
  };
  questions: QuizQuestion[];
  submission: {
    attempt_number: number;
    score: number;
    answers: unknown;
    submitted_at: Date | string;
  };
  xp_earned: number;
}

interface QuizResultAILNProps {
  quizId: string;
}

export default function QuizResultAILN({ quizId }: QuizResultAILNProps) {
  const { data, isLoading, isError } = trpc.read.quizResult.useQuery({
    quiz_id: quizId,
  });

  if (isLoading) {
    return (
      <PageContainerAILN>
        <AppLoadingComponents />
      </PageContainerAILN>
    );
  }
  const d = data as unknown as QuizResultPayload | undefined;
  if (isError || !d?.quiz) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const { quiz, questions, submission, xp_earned } = d;
  const score = submission.score;
  const answers: Record<string, string | null> =
    submission.answers &&
    typeof submission.answers === "object" &&
    submission.answers !== null
      ? (submission.answers as Record<string, string | null>)
      : {};

  // Hitung statistik
  const totalQuestions = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  for (const q of questions) {
    const sel = answers[String(q.id)];
    if (sel === null || sel === undefined) {
      unansweredCount += 1;
    } else if (q.options.some((o) => o.is_correct && o.option_code === sel)) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }
  }
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <PageHeaderAILN
          title="Hasil Quiz"
          desc={`Lihat skor, XP, dan pembahasan jawaban untuk ${quiz.name}.`}
        />

        <QuizSummaryBannerAILN
          accuracy={accuracy}
          correctCount={correctCount}
          score={score}
          totalQuestions={totalQuestions}
          wrongCount={wrongCount + unansweredCount}
          xpEarned={xp_earned}
        />

        {/* Pembahasan Jawaban */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold dark:text-white">
            Pembahasan Jawaban
          </h3>
          {questions.map((question, index) => (
            <QuizAnswerDiscussionItemAILN
              key={question.id}
              no={index + 1}
              question={question}
              selected={answers[String(question.id)]}
            />
          ))}
        </div>
      </div>
    </PageContainerAILN>
  );
}
