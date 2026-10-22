"use client";
import { useStudentIdentity } from "@/contexts/StudentIdentityContext";
import {
  browserDraftKey,
  readBrowserDraft,
  writeBrowserDraft,
} from "@/lib/browser-draft";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import type {
  ChapterTestAnswers,
  ChapterTestDetail,
} from "@/apis/chapter-tests";
import {
  CHAPTER_TEST_ESSAY_MAX,
  CHAPTER_TEST_KIND_LABEL,
} from "@/lib/chapter-evaluation";
import { useProjectId } from "@/lib/use-project-id";
import {
  faChevronLeft,
  faChevronRight,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ChapterTestAttemptAILNProps {
  test: ChapterTestDetail;
}

// Unsent answers survive a refresh in this browser only; the backend has no draft endpoint for tests.
function readDraft(test: ChapterTestDetail, key: string): ChapterTestAnswers {
  try {
    const saved =
      readBrowserDraft<ChapterTestAnswers>(window.localStorage, key) ?? {};
    return Object.fromEntries(
      test.questions.flatMap((question) => {
        const answer = saved[String(question.id)];
        if (typeof answer !== "string") return [];
        if (
          question.type === "multiple_choice" &&
          !question.options.some((option) => option.option_code === answer)
        )
          return [];
        return [[String(question.id), answer]];
      }),
    );
  } catch {
    return {};
  }
}

export default function ChapterTestAttemptAILN({
  test,
}: ChapterTestAttemptAILNProps) {
  const router = useRouter();
  const projectId = useProjectId();
  const { questions } = test;
  const userId = useStudentIdentity();
  const key = browserDraftKey(
    userId ?? "",
    projectId,
    `chapter-test:${test.id}:${questions.map((q) => q.id).join("-")}`,
  );
  const [draftWarning, setDraftWarning] = useState(false);
  const kindLabel = CHAPTER_TEST_KIND_LABEL[test.kind];

  const [answers, setAnswers] = useState<ChapterTestAnswers>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const draft = readDraft(test, key);
    queueMicrotask(() => {
      setAnswers(draft);
      setDraftLoaded(true);
    });
  }, [test, key]);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      writeBrowserDraft(window.localStorage, key, answers);
      queueMicrotask(() => setDraftWarning(false));
    } catch {
      queueMicrotask(() => setDraftWarning(true));
    }
  }, [answers, draftLoaded, key]);

  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;
  const isLast = currentIdx === totalQuestions - 1;
  const isAnswered = (questionId: number) =>
    (answers[String(questionId)] ?? "").trim() !== "";
  const answeredCount = questions.filter((q) => isAnswered(q.id)).length;

  const setAnswer = (value: string) => {
    if (!currentQ || isSubmitting) return;
    setAnswers((prev) => ({ ...prev, [String(currentQ.id)]: value }));
  };

  const requestSubmit = () => {
    const firstUnanswered = questions.findIndex((q) => !isAnswered(q.id));
    if (firstUnanswered !== -1) {
      setCurrentIdx(firstUnanswered);
      toast.error("Jawab semua soal dulu sebelum mengirim.");
      return;
    }
    setIsSubmitDialogOpen(true);
  };

  const submit = async () => {
    setIsSubmitDialogOpen(false);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/chapter-tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_id: test.id,
          answers: Object.fromEntries(
            questions.map((question) => [
              String(question.id),
              answers[String(question.id)],
            ]),
          ),
        }),
      });
      const payload = res.headers
        .get("content-type")
        ?.includes("application/json")
        ? await res.json().catch(() => null)
        : null;
      if (
        !res.redirected &&
        ((res.ok && payload?.submitted_at) || res.status === 409)
      ) {
        try {
          writeBrowserDraft(window.localStorage, key, null);
        } catch {}
        if (res.status === 409)
          toast.info(`${kindLabel} ini sudah pernah kamu kirim.`);
        router.refresh();
        return;
      }
      const backendMessage =
        typeof payload?.message === "string" ? payload.message : null;
      toast.error(
        res.redirected || res.status === 401
          ? "Sesi kamu sudah berakhir. Masuk kembali, lalu kirim jawaban yang tersimpan."
          : res.status === 403
            ? `${kindLabel} ini belum bisa dikirim. ${backendMessage ?? "Selesaikan bagian sebelumnya dulu."}`
            : backendMessage && res.status === 400
              ? `Jawaban belum terkirim: ${backendMessage}`
              : `Gagal mengirim jawaban ${kindLabel.toLowerCase()}. Coba lagi.`,
      );
    } catch {
      toast.error(
        `Gagal mengirim jawaban ${kindLabel.toLowerCase()}. Coba lagi.`,
      );
    }
    setIsSubmitting(false);
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <p role="status" className="text-sm text-muted-foreground">
          {draftWarning
            ? "Draft belum tersimpan. Jangan tutup halaman sebelum jawaban terkirim."
            : "Draft tersimpan di browser ini untuk akunmu, belum terkirim."}
        </p>
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 dark:border-dashboard-border dark:bg-card-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-widest text-emphasis dark:text-gray-400">
                {kindLabel} · {test.chapter.name}
              </div>
              <h1 className="text-base font-medium dark:text-white">
                {test.name}
              </h1>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-dashboard-border dark:text-gray-300">
              Soal {totalQuestions === 0 ? 0 : currentIdx + 1} /{" "}
              {totalQuestions}
            </span>
            <ButtonAILN
              variant="neutral"
              size="small"
              type="button"
              onClick={() => setIsExitDialogOpen(true)}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="h-3.5 w-3.5"
              />
              Keluar
            </ButtonAILN>
          </div>
          {test.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {test.description}
            </p>
          )}
          <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
            {questions.map((q) => (
              <div
                key={q.id}
                className={`h-full flex-1 ${
                  isAnswered(q.id)
                    ? "bg-claude"
                    : "bg-gray-200 dark:bg-dashboard-border"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          {/* Question */}
          <div className="flex flex-1 flex-col gap-4 rounded-lg border bg-white p-4 sm:p-6 dark:border-dashboard-border dark:bg-card-1">
            {currentQ ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    SOAL {currentIdx + 1}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-dashboard-border dark:text-gray-300">
                    {currentQ.type === "essay" ? "Uraian" : "Pilihan ganda"}
                  </span>
                </div>
                <p className="whitespace-pre-line text-[17px] font-medium leading-snug text-gray-900 dark:text-white">
                  {currentQ.question}
                </p>

                {currentQ.type === "essay" ? (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tulis jawabanmu dengan kalimatmu sendiri.
                    </p>
                    <TextAreaAILN
                      key={currentQ.id}
                      textAreaId={`essay-${currentQ.id}`}
                      textAreaName="Jawaban uraian"
                      textAreaHeight="h-48"
                      textAreaPlaceholder="Tulis jawaban di sini..."
                      characterLength={CHAPTER_TEST_ESSAY_MAX}
                      value={answers[String(currentQ.id)] ?? ""}
                      variant="STUDENT"
                      disabled={isSubmitting}
                      onTextAreaChange={setAnswer}
                    />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pilih satu jawaban yang paling tepat.
                    </p>
                    <div className="flex flex-col gap-2">
                      {currentQ.options.map((opt) => {
                        const isSelected =
                          answers[String(currentQ.id)] === opt.option_code;
                        return (
                          <ButtonAILN
                            aria-pressed={isSelected}
                            variant={isSelected ? "answerActive" : "answer"}
                            size="choice"
                            width="full"
                            key={opt.id}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setAnswer(opt.option_code)}
                          >
                            <div
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                                isSelected
                                  ? "bg-claude text-white"
                                  : "bg-gray-200 text-gray-700 dark:bg-dashboard-border dark:text-gray-300"
                              }`}
                            >
                              {opt.option_code.toUpperCase()}
                            </div>
                            <span className="flex-1">{opt.text}</span>
                          </ButtonAILN>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Belum ada pertanyaan pada {kindLabel.toLowerCase()} ini.
              </p>
            )}

            <div className="mt-auto flex items-center justify-between border-t pt-4 dark:border-dashboard-border">
              <ButtonAILN
                variant="neutral"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
                Sebelumnya
              </ButtonAILN>
              <ButtonAILN
                variant="forest"
                onClick={() =>
                  setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1))
                }
                disabled={isLast || totalQuestions === 0}
              >
                Berikutnya
                <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
              </ButtonAILN>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 dark:border-dashboard-border dark:bg-card-1">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
                NAVIGASI SOAL
              </span>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  return (
                    <ButtonAILN
                      variant={
                        idx === currentIdx
                          ? "questionCurrent"
                          : isAnswered(q.id)
                            ? "questionAnswered"
                            : "question"
                      }
                      size="question"
                      key={q.id}
                      type="button"
                      aria-label={`Soal ${idx + 1}, ${isAnswered(q.id) ? "terjawab" : "belum dijawab"}`}
                      aria-current={idx === currentIdx ? "step" : undefined}
                      onClick={() => setCurrentIdx(idx)}
                    >
                      {idx + 1}
                    </ButtonAILN>
                  );
                })}
              </div>
              <p className="border-t pt-3 text-xs text-gray-600 dark:border-dashboard-border dark:text-gray-400">
                {answeredCount} dari {totalQuestions} soal terjawab.{" "}
                {test.essay_count > 0 &&
                  `${test.essay_count} soal uraian tidak masuk skor otomatis.`}
              </p>
            </div>

            <ButtonAILN
              variant="lime"
              width="full"
              disabled={isSubmitting || totalQuestions === 0}
              onClick={requestSubmit}
            >
              {isSubmitting ? "Mengirim..." : "Kirim jawaban"}
            </ButtonAILN>
          </div>
        </div>
      </div>
      <AlertConfirmDialogAILN
        isOpen={isSubmitDialogOpen}
        alertDialogHeader={`Kirim ${kindLabel.toLowerCase()}?`}
        alertDialogMessage={`${kindLabel} hanya bisa dikerjakan satu kali. Jawaban tidak bisa diubah setelah dikirim.`}
        alertCancelLabel="Cek lagi"
        alertConfirmLabel="Kirim sekarang"
        onClose={() => setIsSubmitDialogOpen(false)}
        onConfirm={submit}
      />
      <AlertConfirmDialogAILN
        isOpen={isExitDialogOpen}
        alertDialogHeader={`Keluar dari ${kindLabel.toLowerCase()}?`}
        alertDialogMessage={
          draftWarning
            ? "Draft belum dapat disimpan di browser ini. Tetap keluar akan menghilangkan jawaban yang belum terkirim."
            : "Jawabanmu tersimpan sementara di browser ini untuk akunmu, tapi belum terkirim sampai kamu menekan Kirim jawaban."
        }
        alertCancelLabel="Batal"
        alertConfirmLabel="Tetap keluar"
        onClose={() => setIsExitDialogOpen(false)}
        onConfirm={() => {
          setIsExitDialogOpen(false);
          router.push(`/${projectId}/student/learning-path/${test.chapter.id}`);
        }}
      />
    </PageContainerAILN>
  );
}
