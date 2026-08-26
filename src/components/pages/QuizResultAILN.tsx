"use client";
import QuizSummaryBannerAILN from "@/components/banners/QuizSummaryBannerAILN";
import QuizAnswerDiscussionItemAILN from "@/components/items/QuizAnswerDiscussionItemAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { QuizResult } from "@/apis/learnings";

interface QuizResultAILNProps {
  result: QuizResult;
}

export default function QuizResultAILN({ result }: QuizResultAILNProps) {
  const { name, questions, submission, xp_earned } = result;
  const score = submission.score;
  const answers = submission.answers ?? {};

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

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <PageHeaderAILN
          title="Hasil Quiz"
          desc={`Lihat skor, XP, dan pembahasan jawaban untuk ${name}.`}
        />

        <QuizSummaryBannerAILN
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
