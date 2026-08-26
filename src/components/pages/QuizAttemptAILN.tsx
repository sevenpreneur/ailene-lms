"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import { getDurationFromSeconds } from "@/lib/date-time-manipulation";
import { useProjectId } from "@/lib/use-project-id";
import {
  faChevronLeft,
  faChevronRight,
  faClock,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface QuizOption {
  id: number;
  option_code: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  order_index: number;
  xp_reward: number;
  options: QuizOption[];
}

export interface QuizDetailsData {
  quiz: {
    id: string;
    name: string;
    description: string | null;
    chapter: { id: number; name: string } | null;
  };
  questions: QuizQuestion[];
}

const UPDATE_DEBOUNCE_MS = 800;

interface QuizAttemptAILNProps {
  data: QuizDetailsData;
  initialAnswers: Record<string, string | null>;
  initialSecondsLeft: number;
}

export default function QuizAttemptAILN({
  data,
  initialAnswers,
  initialSecondsLeft,
}: QuizAttemptAILNProps) {
  const router = useRouter();
  const projectId = useProjectId();
  const { quiz, questions } = data;

  // Jawaban user, key = question id (string), value = option_code yang dipilih
  const [answers, setAnswers] = useState<Record<string, string | null>>(
    initialAnswers
  );
  // Index soal yang lagi ditampilin (mulai dari 0)
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tiap detik, kurangi secondsLeft, berhenti di 0.
  useEffect(() => {
    if (secondsLeft <= 0 || isSubmitting) return;
    const id = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, isSubmitting]);

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  // Trigger the actual submit call once isSubmitting flips true.
  useEffect(() => {
    if (!isSubmitting) return;
    let cancelled = false;

    fetch("/api/quizzes/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_id: quiz.id, answers }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(() => {
        if (cancelled) return;
        router.refresh();
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Gagal mengirim jawaban quiz. Coba lagi.");
        setIsSubmitting(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting]);

  // Auto-submit begitu waktu habis.
  useEffect(() => {
    if (secondsLeft > 0) return;
    handleSubmit();
  }, [secondsLeft, handleSubmit]);

  // Debounced autosave — kirim draft jawaban terbaru ~800ms setelah pilihan terakhir.
  const isFirstAnswersRender = useRef(true);
  useEffect(() => {
    if (isFirstAnswersRender.current) {
      isFirstAnswersRender.current = false;
      return;
    }
    if (isSubmitting) return;

    const id = setTimeout(() => {
      fetch("/api/quizzes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: quiz.id, answers }),
      }).catch(() => {});
    }, UPDATE_DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [answers, quiz.id, isSubmitting]);

  // ===== DERIVED VALUES =====
  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;

  const handleSelect = (optionCode: string) => {
    if (!currentQ || isSubmitting) return;
    const qid = String(currentQ.id);
    setAnswers((prev) => ({ ...prev, [qid]: optionCode }));
  };

  // Navigasi antar soal
  const handlePrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const handleNext = () =>
    setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1));

  // Buka dialog konfirmasi dulu saat mau keluar
  const handleExit = () => setIsExitDialogOpen(true);
  const handleConfirmExit = () => {
    setIsExitDialogOpen(false);
    router.push(`/${projectId}/student`);
  };

  const isLast = currentIdx === totalQuestions - 1;
  const timeIsUp = secondsLeft <= 0;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="flex-1 text-base font-semibold dark:text-white">
              {quiz.name}
            </h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-dashboard-border dark:text-gray-300">
              Soal {currentIdx + 1} / {totalQuestions}
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                secondsLeft <= 60
                  ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300 dark:border dark:border-red-500/40 dark:shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                  : secondsLeft <= 300
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 dark:border dark:border-amber-500/40"
                    : "bg-gray-50 text-gray-700 dark:bg-dashboard-border dark:text-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
              {timeIsUp
                ? "Waktu habis"
                : `${getDurationFromSeconds(secondsLeft)} tersisa`}
            </span>
            <button
              type="button"
              onClick={handleExit}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-dashboard-border dark:text-gray-300 dark:hover:bg-card-2"
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="h-3.5 w-3.5"
              />
              Keluar
            </button>
          </div>
          <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
            {questions.map((q, idx) => {
              const qid = String(q.id);
              const isAnswered = qid in answers && answers[qid] != null;
              return (
                <div
                  key={idx}
                  className={`h-full flex-1 ${
                    isAnswered
                      ? "bg-claude dark:bg-claude dark:shadow-[0_0_6px_rgba(26,122,82,0.6)]"
                      : "bg-gray-200 dark:bg-dashboard-border"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Main body */}
        <div className="flex flex-1 gap-4">
          {/* Left panel: question */}
          <div className="flex flex-1 flex-col gap-4 rounded-xl border bg-white p-6 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                SOAL {currentIdx + 1}
              </span>
            </div>
            {currentQ ? (
              <>
                <p className="text-[17px] font-semibold leading-snug text-gray-900 dark:text-white">
                  {currentQ.question}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pilih satu jawaban yang paling tepat.
                </p>

                <div className="flex flex-col gap-2">
                  {currentQ.options.map((opt) => {
                    const qid = String(currentQ.id);
                    const isSelected = answers[qid] === opt.option_code;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSelect(opt.option_code)}
                        className={`flex items-center gap-3 rounded-lg border-[1.5px] px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          isSelected
                            ? "border-claude bg-hijau-t dark:border-claude/60 dark:bg-claude/10 dark:text-white dark:shadow-[0_0_10px_rgba(26,122,82,0.25)]"
                            : "border-gray-200 bg-white hover:border-black/30 hover:bg-gray-50 dark:border-dashboard-border dark:bg-card-1 dark:text-gray-200 dark:hover:border-claude/30 dark:hover:bg-card-2"
                        }`}
                      >
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isSelected
                              ? "bg-claude text-white dark:shadow-[0_0_8px_rgba(26,122,82,0.6)]"
                              : "bg-gray-200 text-gray-700 dark:bg-dashboard-border dark:text-gray-300"
                          }`}
                        >
                          {opt.option_code.toUpperCase()}
                        </div>
                        <span className="flex-1">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Belum ada pertanyaan pada quiz ini.
              </p>
            )}

            <div className="mt-auto flex items-center justify-between border-t pt-4 dark:border-dashboard-border">
              <ButtonAILN
                variant="neutral"
                onClick={handlePrev}
                disabled={currentIdx === 0}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
                Sebelumnya
              </ButtonAILN>
              <ButtonAILN
                variant="forest"
                onClick={handleNext}
                disabled={isLast}
              >
                Berikutnya
                <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
              </ButtonAILN>
            </div>
          </div>

          {/* Right panel: navigation */}
          <div className="flex w-72 shrink-0 flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                NAVIGASI SOAL
              </span>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const qid = String(q.id);
                  const isCurrent = idx === currentIdx;
                  const isAnswered = qid in answers && answers[qid] != null;

                  let cls = "";
                  if (isCurrent) {
                    cls =
                      "bg-claude text-white dark:shadow-[0_0_10px_rgba(26,122,82,0.7)]";
                  } else if (isAnswered) {
                    cls =
                      "bg-black text-white dark:bg-claude/20 dark:text-lime-bright dark:border dark:border-claude/40";
                  } else {
                    cls =
                      "border border-gray-200 bg-gray-100 text-gray-500 dark:border-dashboard-border dark:bg-card-2 dark:text-gray-400";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`flex aspect-square items-center justify-center rounded-md text-xs font-semibold transition hover:opacity-80 ${cls}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1.5 border-t pt-3 text-xs text-gray-600 dark:border-dashboard-border dark:text-gray-400">
                <LegendItem
                  color="bg-black dark:bg-claude/20 dark:border dark:border-claude/40"
                  label="Terjawab"
                />
                <LegendItem
                  color="bg-claude dark:shadow-[0_0_6px_rgba(26,122,82,0.6)]"
                  label="Saat ini"
                />
                <LegendItem
                  color="bg-gray-100 border border-gray-200 dark:bg-card-2 dark:border-dashboard-border"
                  label="Belum"
                />
              </div>
            </div>

            <ButtonAILN
              variant="lime"
              className="w-full"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Mengirim..." : "Submit jawaban"}
            </ButtonAILN>
          </div>
        </div>
      </div>
      <AlertConfirmDialogAILN
        isOpen={isExitDialogOpen}
        alertDialogHeader="Keluar dari quiz?"
        alertDialogMessage="Waktu quiz tetap berjalan walau kamu keluar halaman. Jawaban yang sudah dipilih tersimpan otomatis, tapi quiz akan otomatis disubmit ketika waktu habis."
        alertCancelLabel="Batal"
        alertConfirmLabel="Tetap keluar"
        onClose={() => setIsExitDialogOpen(false)}
        onConfirm={handleConfirmExit}
      />
    </PageContainerAILN>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded ${color}`} />
      <span>{label}</span>
    </div>
  );
}
