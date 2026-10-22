"use client";
import dayjs from "dayjs";
import { useStudentIdentity } from "@/contexts/StudentIdentityContext";
import {
  browserDraftKey,
  readBrowserDraft,
  writeBrowserDraft,
} from "@/lib/browser-draft";
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
  attemptStartedAt: string | null;
}

export default function QuizAttemptAILN({
  data,
  initialAnswers,
  initialSecondsLeft,
  attemptStartedAt,
}: QuizAttemptAILNProps) {
  const router = useRouter();
  const projectId = useProjectId();
  const { quiz, questions } = data;

  // Jawaban user, key = question id (string), value = option_code yang dipilih
  const [answers, setAnswers] =
    useState<Record<string, string | null>>(initialAnswers);
  // Index soal yang lagi ditampilin (mulai dari 0)
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = useStudentIdentity();
  const draftKey = browserDraftKey(
    userId ?? "",
    projectId,
    `quiz:${quiz.id}:${attemptStartedAt ?? "active"}`,
  );
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [saveState, setSaveState] = useState<
    "pending" | "saving" | "saved" | "failed"
  >("saved");
  const [localWarning, setLocalWarning] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const answersRef = useRef(answers);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const submittingRef = useRef(false);
  const autoSubmitted = useRef(false);
  const deadline = useRef(dayjs().add(initialSecondsLeft, "second"));

  useEffect(() => {
    try {
      const local = readBrowserDraft<Record<string, string | null>>(
        window.localStorage,
        draftKey,
      );
      const valid = Object.fromEntries(
        questions.flatMap((q) =>
          typeof local?.[String(q.id)] === "string" &&
          q.options.some((option) => option.option_code === local[String(q.id)])
            ? [[String(q.id), local[String(q.id)]]]
            : [],
        ),
      );
      const restored = { ...initialAnswers, ...valid };
      answersRef.current = restored;
      setAnswers(restored);
    } catch {
      setLocalWarning(true);
    }
    setDraftLoaded(true);
    // A new attempt mounts a new form; edits must not trigger restoration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    const tick = () =>
      setSecondsLeft(Math.max(0, deadline.current.diff(dayjs(), "second")));
    const id = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const saveAnswers = useCallback(() => {
    const snapshot = answersRef.current;
    setSaveState("saving");
    const next = saveQueue.current
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch("/api/quizzes/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quiz_id: quiz.id, answers: snapshot }),
          keepalive: true,
        });
        if (
          !response.ok ||
          response.redirected ||
          !response.headers.get("content-type")?.includes("application/json")
        )
          throw new Error("Jawaban belum tersimpan ke server.");
        const payload = await response.json();
        if (payload?.status === "finalized") router.refresh();
      });
    saveQueue.current = next;
    return next.then(
      () => {
        if (answersRef.current === snapshot) setSaveState("saved");
      },
      (error: unknown) => {
        setSaveState("failed");
        throw error;
      },
    );
  }, [quiz.id, router]);

  useEffect(() => {
    if (!draftLoaded || isSubmitting) return;
    answersRef.current = answers;
    try {
      writeBrowserDraft(window.localStorage, draftKey, answers);
      setLocalWarning(false);
    } catch {
      setLocalWarning(true);
    }
    setSaveState("pending");
    const id = window.setTimeout(() => {
      void saveAnswers().catch(() => undefined);
    }, UPDATE_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [answers, draftLoaded, draftKey, isSubmitting, saveAnswers]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitDialogOpen(false);
    setIsSubmitting(true);
    try {
      // Let queued draft writes finish before finalizing, so an old response cannot overwrite newer work.
      await saveQueue.current.catch(() => undefined);
      const response = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: quiz.id, answers: answersRef.current }),
      });
      if (
        !response.ok ||
        response.redirected ||
        !response.headers.get("content-type")?.includes("application/json")
      )
        throw new Error();
      await response.json();
      try {
        writeBrowserDraft(window.localStorage, draftKey, null);
      } catch {}
      router.refresh();
    } catch {
      toast.error("Jawaban belum terkirim. Periksa koneksi lalu kirim lagi.");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [quiz.id, draftKey, router]);

  useEffect(() => {
    if (!draftLoaded || secondsLeft > 0 || autoSubmitted.current) return;
    autoSubmitted.current = true;
    void handleSubmit();
  }, [draftLoaded, secondsLeft, handleSubmit]);

  useEffect(() => {
    if (saveState === "saved" || isSubmitting) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState, isSubmitting]);

  // ===== DERIVED VALUES =====
  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;

  const handleSelect = (optionCode: string) => {
    if (!currentQ || isSubmitting) return;
    const qid = String(currentQ.id);
    const next = { ...answersRef.current, [qid]: optionCode };
    answersRef.current = next;
    setAnswers(next);
  };

  // Navigasi antar soal
  const handlePrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const handleNext = () =>
    setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1));

  // Buka dialog konfirmasi dulu saat mau keluar
  const handleExit = () => setIsExitDialogOpen(true);
  const handleConfirmExit = async () => {
    try {
      await saveAnswers();
      setIsExitDialogOpen(false);
      router.push(`/${projectId}/student`);
    } catch {
      toast.error(
        "Jawaban belum tersimpan ke server. Coba lagi sebelum keluar.",
      );
    }
  };

  const isLast = currentIdx === totalQuestions - 1;
  const timeIsUp = secondsLeft <= 0;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <div
          role="status"
          className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          {saveState === "saved"
            ? "Jawaban tersimpan ke server."
            : saveState === "failed"
              ? "Jawaban belum tersimpan ke server."
              : "Menyimpan jawaban?"}
          {saveState === "failed" && (
            <ButtonAILN
              variant="outline"
              size="small"
              onClick={() => void saveAnswers().catch(() => undefined)}
            >
              Coba simpan lagi
            </ButtonAILN>
          )}
          {localWarning && (
            <span>
              Draft browser tidak tersedia. Tunggu penyimpanan server sebelum
              keluar.
            </span>
          )}
        </div>
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="flex-1 text-base font-medium dark:text-white">
              {quiz.name}
            </h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-dashboard-border dark:text-gray-300">
              Soal {currentIdx + 1} / {totalQuestions}
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
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
            <ButtonAILN
              variant="neutral"
              size="small"
              type="button"
              onClick={handleExit}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="h-3.5 w-3.5"
              />
              Keluar
            </ButtonAILN>
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
        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          {/* Left panel: question */}
          <div className="flex flex-1 flex-col gap-4 rounded-lg border bg-white p-4 sm:p-6 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
                SOAL {currentIdx + 1}
              </span>
            </div>
            {currentQ ? (
              <>
                <p className="text-[17px] font-medium leading-snug text-gray-900 dark:text-white">
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
                      <ButtonAILN
                        aria-pressed={isSelected}
                        variant={isSelected ? "answerActive" : "answer"}
                        size="choice"
                        width="full"
                        key={opt.id}
                        type="button"
                        disabled={isSubmitting || !draftLoaded}
                        onClick={() => handleSelect(opt.option_code)}
                      >
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                            isSelected
                              ? "bg-claude text-white dark:shadow-[0_0_8px_rgba(26,122,82,0.6)]"
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
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
                NAVIGASI SOAL
              </span>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const qid = String(q.id);
                  const isCurrent = idx === currentIdx;
                  const isAnswered = qid in answers && answers[qid] != null;

                  return (
                    <ButtonAILN
                      variant={
                        isCurrent
                          ? "questionCurrent"
                          : isAnswered
                            ? "questionAnswered"
                            : "question"
                      }
                      size="question"
                      key={q.id}
                      type="button"
                      aria-label={`Soal ${idx + 1}, ${isAnswered ? "terjawab" : "belum dijawab"}`}
                      aria-current={isCurrent ? "step" : undefined}
                      onClick={() => setCurrentIdx(idx)}
                    >
                      {idx + 1}
                    </ButtonAILN>
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
              width="full"
              disabled={isSubmitting || !draftLoaded}
              onClick={() => setIsSubmitDialogOpen(true)}
            >
              {isSubmitting ? "Mengirim..." : "Submit jawaban"}
            </ButtonAILN>
          </div>
        </div>
      </div>
      <AlertConfirmDialogAILN
        isOpen={isSubmitDialogOpen}
        alertDialogHeader="Kirim jawaban quiz?"
        alertDialogMessage={`${questions.filter((q) => answers[String(q.id)] != null).length} dari ${totalQuestions} soal terjawab. Setelah dikirim, jawaban tidak dapat diubah. Cek soal yang belum terjawab sebelum melanjutkan.`}
        alertCancelLabel="Cek lagi"
        alertConfirmLabel="Kirim sekarang"
        onClose={() => setIsSubmitDialogOpen(false)}
        onConfirm={() => void handleSubmit()}
      />
      <AlertConfirmDialogAILN
        isOpen={isExitDialogOpen}
        alertDialogHeader="Keluar dari quiz?"
        alertDialogMessage="Waktu quiz tetap berjalan. Saat memilih Keluar, kami menyimpan jawaban terakhir ke server terlebih dahulu. Jika gagal, halaman tetap terbuka agar kamu bisa mencoba lagi."
        alertCancelLabel="Batal"
        alertConfirmLabel="Tetap keluar"
        onClose={() => setIsExitDialogOpen(false)}
        onConfirm={() => void handleConfirmExit()}
      />
    </PageContainerAILN>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded-lg ${color}`} />
      <span>{label}</span>
    </div>
  );
}
