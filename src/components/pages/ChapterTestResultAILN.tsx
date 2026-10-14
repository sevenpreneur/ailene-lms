"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ChapterTestAnswerItemAILN from "@/components/items/ChapterTestAnswerItemAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { ChapterTestResult } from "@/apis/chapter-tests";
import { CHAPTER_TEST_KIND_LABEL } from "@/lib/chapter-evaluation";
import { useProjectId } from "@/lib/use-project-id";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Link from "next/link";

interface ChapterTestResultAILNProps {
  result: ChapterTestResult;
}

export default function ChapterTestResultAILN({
  result,
}: ChapterTestResultAILNProps) {
  const projectId = useProjectId();
  const kindLabel = CHAPTER_TEST_KIND_LABEL[result.kind];
  const { submission } = result;
  const essayCount = result.questions.filter((q) => q.type === "essay").length;
  const gain =
    result.kind === "post_test" &&
    submission.score !== null &&
    result.pre_test_score !== null
      ? submission.score - result.pre_test_score
      : null;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <PageHeaderAILN
          title={`Hasil ${kindLabel}`}
          desc={`${result.name} · ${result.chapter.name}`}
        >
          <Link
            href={`/${projectId}/student/learning-path/${result.chapter.id}`}
          >
            <ButtonAILN variant="neutral" size="small">
              Kembali ke Alur Belajar
            </ButtonAILN>
          </Link>
        </PageHeaderAILN>

        <section className="grid gap-4 rounded-lg border border-dashboard-border bg-card-1 p-5 sm:grid-cols-3">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Skor {kindLabel.toLowerCase()}
            </div>
            <div className="font-headline text-5xl font-medium leading-tight dark:text-white">
              {submission.score ?? "-"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {submission.choice_count > 0
                ? `${submission.correct_count} dari ${submission.choice_count} soal pilihan ganda benar`
                : "Tidak ada soal pilihan ganda yang dinilai otomatis"}
            </div>
          </div>

          {result.kind === "post_test" && (
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Skor pre-test
              </div>
              <div className="font-headline text-5xl font-medium leading-tight text-gray-400 dark:text-gray-500">
                {result.pre_test_score ?? "-"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Sebelum kamu belajar chapter ini
              </div>
            </div>
          )}

          {gain !== null && (
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Peningkatan
              </div>
              <div
                className={`font-headline text-5xl font-medium leading-tight ${
                  gain > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : gain < 0
                      ? "text-red-600 dark:text-red-400"
                      : "dark:text-white"
                }`}
              >
                {gain > 0 ? `+${gain}` : gain}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Poin dibanding pre-test
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 sm:col-span-3 dark:text-gray-400">
            Dikirim{" "}
            {dayjs(submission.submitted_at).locale("id").format("D MMMM YYYY, HH:mm")}
            {essayCount > 0 &&
              ` · ${essayCount} jawaban uraian disimpan untuk ditinjau.`}
          </div>
        </section>

        {!result.answers_revealed && (
          <div className="flex items-center gap-3 rounded-lg border border-dashboard-border bg-card-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            <FontAwesomeIcon icon={faLock} className="h-4 w-4 shrink-0" />
            Kunci jawaban pre-test akan muncul setelah kamu mengerjakan
            post-test, supaya post-test tetap mengukur hasil belajarmu.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="text-base font-medium dark:text-white">
            Jawaban Kamu
          </h3>
          {result.questions.map((question, index) => (
            <ChapterTestAnswerItemAILN
              key={question.id}
              no={index + 1}
              question={question}
            />
          ))}
        </div>
      </div>
    </PageContainerAILN>
  );
}
