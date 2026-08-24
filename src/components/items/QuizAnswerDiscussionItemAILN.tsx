"use client";

import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import {
  faCircleCheck,
  faCircleXmark,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type QuizOption = {
  id: number;
  option_code: string;
  text: string;
  is_correct: boolean;
};

type QuizQuestion = {
  id: number;
  question: string;
  explanation: string | null;
  options: QuizOption[];
};

interface QuizAnswerDiscussionItemAILNProps {
  no: number;
  question: QuizQuestion;
  selected?: string | null;
}

export default function QuizAnswerDiscussionItemAILN({
  no,
  question,
  selected,
}: QuizAnswerDiscussionItemAILNProps) {
  const isUnanswered = selected === null || selected === undefined;
  const isCorrect =
    !isUnanswered &&
    question.options.some(
      (option) => option.is_correct && option.option_code === selected
    );
  const correctOption = question.options.find((option) => option.is_correct);
  const selectedOption = question.options.find(
    (option) => option.option_code === selected
  );
  const status = getAnswerStatus(isUnanswered, isCorrect);

  return (
    <article className="flex items-start gap-4 rounded-xl border border-dashboard-border bg-card-1 p-5 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:border dark:border-claude/40 dark:bg-claude/20 dark:text-lime-bright">
        {no}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-white">
            {question.question}
          </p>
          <GeneralLabelAILN
            variant={status.variant}
            icon={<FontAwesomeIcon icon={status.icon} className="h-3 w-3" />}
            className="shrink-0"
          >
            {status.label}
          </GeneralLabelAILN>
        </div>

        <div className="flex flex-col gap-1">
          {!isUnanswered && (
            <p className="flex items-baseline gap-2 text-xs">
              <FontAwesomeIcon
                icon={isCorrect ? faCircleCheck : faCircleXmark}
                className={`h-3 w-3 ${
                  isCorrect
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
              <span
                className={
                  isCorrect
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                Jawaban kamu:{" "}
                <strong>
                  {selectedOption?.option_code.toUpperCase()}.{" "}
                  {selectedOption?.text}
                </strong>
              </span>
            </p>
          )}
          <p className="flex items-baseline gap-2 text-xs">
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="h-3 w-3 text-emerald-700 dark:text-emerald-400"
            />
            <span className="text-emerald-700 dark:text-emerald-400">
              Jawaban benar:{" "}
              <strong>
                {correctOption?.option_code.toUpperCase()}. {correctOption?.text}
              </strong>
            </span>
          </p>
        </div>

        {question.explanation && (
          <p className="rounded-lg border border-dashboard-border bg-card-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
            <strong className="font-semibold">Penjelasan: </strong>
            {question.explanation}
          </p>
        )}
      </div>
    </article>
  );
}

function getAnswerStatus(isUnanswered: boolean, isCorrect: boolean): {
  icon: IconDefinition;
  label: string;
  variant: GeneralLabelVariantAILN;
} {
  if (isUnanswered) {
    return { icon: faCircleXmark, label: "Belum Dijawab", variant: "yellow" };
  }
  if (isCorrect) {
    return { icon: faCircleCheck, label: "Benar", variant: "green" };
  }
  return { icon: faCircleXmark, label: "Salah", variant: "red" };
}
