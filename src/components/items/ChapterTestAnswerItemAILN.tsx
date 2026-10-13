"use client";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import type { ChapterTestResultQuestion } from "@/apis/chapter-tests";
import {
  faCircleCheck,
  faCircleXmark,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ChapterTestAnswerItemAILNProps {
  no: number;
  question: ChapterTestResultQuestion;
}

export default function ChapterTestAnswerItemAILN({
  no,
  question,
}: ChapterTestAnswerItemAILNProps) {
  const isEssay = question.type === "essay";
  const revealed = question.is_correct !== null;
  const selected = question.options.find(
    (o) => o.option_code === question.answer
  );
  const correct = question.options.find((o) => o.is_correct === true);

  return (
    <article className="flex items-start gap-4 rounded-lg border border-dashboard-border bg-card-1 p-5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white dark:border dark:border-claude/40 dark:bg-claude/20 dark:text-lime-bright">
        {no}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="min-w-0 flex-1 whitespace-pre-line text-sm font-medium text-gray-900 dark:text-white">
            {question.question}
          </p>
          {isEssay ? (
            <GeneralLabelAILN
              variant="blue"
              icon={<FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />}
              className="shrink-0"
            >
              Uraian
            </GeneralLabelAILN>
          ) : revealed ? (
            <GeneralLabelAILN
              variant={question.is_correct ? "green" : "red"}
              icon={
                <FontAwesomeIcon
                  icon={question.is_correct ? faCircleCheck : faCircleXmark}
                  className="h-3 w-3"
                />
              }
              className="shrink-0"
            >
              {question.is_correct ? "Benar" : "Salah"}
            </GeneralLabelAILN>
          ) : (
            <GeneralLabelAILN variant="white" className="shrink-0">
              Terjawab
            </GeneralLabelAILN>
          )}
        </div>

        {isEssay ? (
          <p className="whitespace-pre-line rounded-lg border border-dashboard-border bg-card-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            {question.answer || "-"}
          </p>
        ) : (
          <div className="flex flex-col gap-1 text-xs">
            <p className="text-gray-700 dark:text-gray-300">
              Jawaban kamu:{" "}
              <strong className="font-medium">
                {selected
                  ? `${selected.option_code.toUpperCase()}. ${selected.text}`
                  : "-"}
              </strong>
            </p>
            {revealed && correct && !question.is_correct && (
              <p className="text-emerald-700 dark:text-emerald-400">
                Jawaban benar:{" "}
                <strong className="font-medium">
                  {correct.option_code.toUpperCase()}. {correct.text}
                </strong>
              </p>
            )}
          </div>
        )}

        {question.explanation && (
          <p className="rounded-lg border border-dashboard-border bg-card-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
            <strong className="font-medium">Penjelasan: </strong>
            {question.explanation}
          </p>
        )}
      </div>
    </article>
  );
}
