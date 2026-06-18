"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import PageContainerSVP from "@/components/pages/PageContainerSVP";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import AppLoadingComponents from "@/components/states/AppLoadingComponents";
import {
  PRE_ASSESSMENT_CATEGORY_COLORS,
  PRE_ASSESSMENT_QUESTIONS,
  PRE_ASSESSMENT_TYPE_LABELS,
  PreAssessmentQuestion,
} from "@/lib/pre-assessment-questions";
import { setSessionToken, trpc } from "@/trpc/client";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AlertConfirmDialogAILN from "../modals/AlertConfirmDialogAILN";

const PRE_ASSESSMENT_REPORT_PATH = "/student/my-progress/pre-assessment-report";

type AnswerValue = string | string[] | null;
type AnswerMap = Record<string, AnswerValue>;
type FreqCode = "NEVER" | "RARELY" | "SOMETIMES" | "OFTEN" | "ALWAYS";

interface PreAssessmentAILNProps {
  sessionToken: string;
}

function isAnswered(q: PreAssessmentQuestion, v: AnswerValue): boolean {
  if (v == null) return false;
  if (q.type === "multi") return Array.isArray(v) && v.length > 0;
  return typeof v === "string" && v.trim().length > 0;
}

export default function PreAssessmentAILN({
  sessionToken,
}: PreAssessmentAILNProps) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const isDark = mounted && resolvedTheme === "dark";
  const nextVariant = isDark ? "neutral" : "primary";

  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading, isError } = trpc.read.preAssessment.mine.useQuery();

  // Sudah pernah mengisi → hasilnya ada di halaman report, bukan di sini.
  useEffect(() => {
    if (data?.pre_assessment) {
      router.replace(PRE_ASSESSMENT_REPORT_PATH);
    }
  }, [data?.pre_assessment, router]);

  const submittedRef = useRef(false);

  const [answers, setAnswers] = useState<AnswerMap>(() => {
    const init: AnswerMap = {};
    for (const q of PRE_ASSESSMENT_QUESTIONS) {
      init[q.field] = q.type === "multi" ? [] : null;
    }
    return init;
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [started, setStarted] = useState(false);

  const totalQuestions = PRE_ASSESSMENT_QUESTIONS.length;
  const currentQ = PRE_ASSESSMENT_QUESTIONS[currentIdx];

  const answeredCount = useMemo(
    () =>
      PRE_ASSESSMENT_QUESTIONS.filter((q) => isAnswered(q, answers[q.field]))
        .length,
    [answers]
  );

  const missingRequired = useMemo(
    () =>
      PRE_ASSESSMENT_QUESTIONS.filter(
        (q) => q.required && !isAnswered(q, answers[q.field])
      ),
    [answers]
  );

  const submitMutation = trpc.create.preAssessment.useMutation({
    onSuccess: () => {
      utils.read.preAssessment.mine.invalidate();
      toast.success("Pre-assessment berhasil dikirim.");
      router.push(PRE_ASSESSMENT_REPORT_PATH);
    },
    onError: (err) => {
      submittedRef.current = false;
      toast.error(err.message || "Gagal mengirim pre-assessment.");
    },
  });

  if (isLoading) {
    return (
      <PageContainerSVP className="flex min-h-screen justify-center">
        <AppLoadingComponents />
      </PageContainerSVP>
    );
  }
  if (isError || !data) {
    return (
      <PageContainerSVP className="flex min-h-screen justify-center">
        <AppErrorComponents />
      </PageContainerSVP>
    );
  }

  // Sudah punya hasil → tampilkan loading sembari redirect ke report (effect).
  if (data.pre_assessment) {
    return (
      <PageContainerSVP className="flex min-h-screen justify-center">
        <AppLoadingComponents />
      </PageContainerSVP>
    );
  }

  if (!started) {
    return <PreAssessmentWelcomeAILN onStart={() => setStarted(true)} />;
  }

  const handleSelectSingle = (code: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.field]: code }));
  };

  const handleToggleMulti = (label: string) => {
    setAnswers((prev) => {
      const cur = (prev[currentQ.field] as string[] | null) ?? [];
      const next = cur.includes(label)
        ? cur.filter((x) => x !== label)
        : [...cur, label];
      return { ...prev, [currentQ.field]: next };
    });
  };

  const handleTextChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.field]: value.length > 0 ? value : null,
    }));
  };

  const handlePrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const handleNext = () =>
    setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1));

  const requestSubmit = () => {
    if (missingRequired.length > 0) {
      toast.error(
        `Masih ada ${missingRequired.length} pertanyaan wajib yang belum dijawab.`
      );
      setCurrentIdx(
        PRE_ASSESSMENT_QUESTIONS.findIndex(
          (q) => q.id === missingRequired[0].id
        )
      );
      return;
    }
    setIsSubmitDialogOpen(true);
  };

  const confirmSubmit = () => {
    if (submittedRef.current) return;
    setIsSubmitDialogOpen(false);
    submittedRef.current = true;

    const payload = {
      ai_use_frequency: answers.ai_use_frequency as
        | "NEVER"
        | "TRIED"
        | "WEEKLY"
        | "DAILY"
        | "INTENSIVE",
      ai_tools_used: (answers.ai_tools_used as string[]) ?? [],
      ai_limitations: (answers.ai_limitations as string[]) ?? [],
      output_review: answers.output_review as
        | "NO_CHECK"
        | "SOMETIMES"
        | "ALWAYS"
        | "CROSS_CHECK"
        | "NO_USE",
      use_cases: (answers.use_cases as string[]) ?? [],
      team_adoption: answers.team_adoption as
        | "NONE"
        | "PERSONAL"
        | "PILOT"
        | "POLICY"
        | "INTEGRATED",
      concrete_example: (answers.concrete_example as string | null) ?? null,
      model_selection: answers.model_selection as FreqCode,
      multimodal_use: answers.multimodal_use as FreqCode,
      workflow_reuse: answers.workflow_reuse as FreqCode,
      prompt_comfort: answers.prompt_comfort as
        | "NONE"
        | "BASIC"
        | "DECENT"
        | "STRUCTURED"
        | "EXPERT",
      prompt_iteration: answers.prompt_iteration as FreqCode,
      refine_scenario: answers.refine_scenario as
        | "TARGETED"
        | "SWITCH_TOOL"
        | "MANUAL"
        | "RESTART",
      professional_attitude: answers.professional_attitude as
        | "TOO_RISKY"
        | "CAUTIOUS"
        | "NEUTRAL"
        | "SUPPORTIVE"
        | "ESSENTIAL",
      data_safety_check: answers.data_safety_check as FreqCode,
      publish_unchecked: answers.publish_unchecked as FreqCode,
      biggest_challenge: (answers.biggest_challenge as string) ?? "",
      training_expectation: (answers.training_expectation as string) ?? "",
      motivation: answers.motivation as
        | "MANDATORY"
        | "CURIOUS"
        | "TENTATIVE"
        | "READY"
        | "EAGER",
    };

    submitMutation.mutate(payload);
  };

  const isLast = currentIdx === totalQuestions - 1;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <PageContainerSVP className="flex min-h-screen justify-center">
      <div className="flex w-full flex-col gap-4 my-10">
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(239,68,68,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold dark:text-white">
                Pre-Assessment AI Readiness
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bantu kami memahami posisi awalmu sebelum pelatihan. Jawaban
                kamu hanya disimpan satu kali — tidak bisa diubah setelah
                dikirim.
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-dashboard-border dark:text-gray-300">
              Soal {currentIdx + 1} / {totalQuestions}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border dark:border-emerald-500/40">
              {answeredCount} / {totalQuestions} terjawab ({progressPct}%)
            </span>
          </div>
          <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
            {PRE_ASSESSMENT_QUESTIONS.map((q, idx) => {
              const ans = isAnswered(q, answers[q.field]);
              return (
                <div
                  key={idx}
                  className={`h-full flex-1 ${
                    ans
                      ? "bg-emerald-600 dark:bg-emerald-500 dark:shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                      : "bg-gray-200 dark:bg-dashboard-border"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Main body */}
        <div className="flex flex-1 gap-4">
          {/* Left: question */}
          <div className="flex flex-1 flex-col gap-4 rounded-xl border bg-white p-6 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(239,68,68,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                SOAL {currentIdx + 1}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  PRE_ASSESSMENT_CATEGORY_COLORS[currentQ.category]
                }`}
              >
                {currentQ.category}
              </span>
              <span className="rounded-full border border-dashboard-border bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-card-1 dark:text-gray-300">
                {PRE_ASSESSMENT_TYPE_LABELS[currentQ.type]}
              </span>
              {!currentQ.required && (
                <span className="rounded-full border border-dashboard-border bg-white px-2.5 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-card-1 dark:text-gray-400">
                  Opsional
                </span>
              )}
            </div>

            <p className="text-[17px] font-semibold leading-snug text-gray-900 dark:text-white">
              {currentQ.question}
              {currentQ.required && (
                <span className="ml-1 text-red-500 dark:text-red-400">*</span>
              )}
            </p>

            <QuestionBody
              question={currentQ}
              value={answers[currentQ.field]}
              onSelectSingle={handleSelectSingle}
              onToggleMulti={handleToggleMulti}
              onTextChange={handleTextChange}
            />

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
                variant={nextVariant}
                onClick={handleNext}
                disabled={isLast}
              >
                Berikutnya
                <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
              </ButtonAILN>
            </div>
          </div>

          {/* Right: navigation panel */}
          <div className="flex w-80 shrink-0 flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(239,68,68,0.08)]">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                NAVIGASI
              </span>
              <div className="grid grid-cols-5 gap-2">
                {PRE_ASSESSMENT_QUESTIONS.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const ans = isAnswered(q, answers[q.field]);

                  let cls = "";
                  if (isCurrent) {
                    cls =
                      "bg-red-500 text-white dark:shadow-[0_0_10px_rgba(239,68,68,0.7)]";
                  } else if (ans) {
                    cls =
                      "bg-black text-white dark:bg-red-500/20 dark:text-red-100 dark:border dark:border-red-500/40";
                  } else {
                    cls =
                      "border border-dashboard-border bg-gray-100 text-gray-500 dark:bg-card-2 dark:text-gray-400";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`flex aspect-square items-center justify-center rounded-md text-xs font-semibold transition hover:opacity-80 ${cls}`}
                      title={q.question}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1.5 border-t pt-3 text-xs text-gray-600 dark:border-dashboard-border dark:text-gray-400">
                <LegendItem
                  color="bg-black dark:bg-red-500/20 dark:border dark:border-red-500/40"
                  label="Terjawab"
                />
                <LegendItem
                  color="bg-red-500 dark:shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                  label="Saat ini"
                />
                <LegendItem
                  color="bg-gray-100 border border-dashboard-border dark:bg-card-2"
                  label="Belum"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border bg-white p-4 dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(239,68,68,0.08)]">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                STATUS
              </span>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Terjawab
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Wajib belum diisi
                </span>
                <span
                  className={`font-semibold ${
                    missingRequired.length === 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {missingRequired.length}
                </span>
              </div>
            </div>

            <ButtonAILN
              variant="primary"
              onClick={requestSubmit}
              disabled={submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? "Mengirim..." : "Kirim Jawaban"}
            </ButtonAILN>
          </div>
        </div>
      </div>

      <AlertConfirmDialogAILN
        isOpen={isSubmitDialogOpen}
        alertDialogHeader="Kirim pre-assessment sekarang?"
        alertDialogMessage="Jawaban hanya bisa dikirim satu kali dan tidak bisa diubah setelahnya. Pastikan semua jawabanmu sudah sesuai."
        alertCancelLabel="Periksa lagi"
        alertConfirmLabel="Kirim sekarang"
        onClose={() => setIsSubmitDialogOpen(false)}
        onConfirm={confirmSubmit}
      />
    </PageContainerSVP>
  );
}

function PreAssessmentWelcomeAILN({ onStart }: { onStart: () => void }) {
  const userQ = trpc.auth.checkSession.useQuery();
  const firstName = userQ.data?.user?.full_name?.split(" ")[0] ?? "teman";
  const totalQuestions = PRE_ASSESSMENT_QUESTIONS.length;

  const points = [
    {
      icon: <BookOpen className="size-4" />,
      title: `${totalQuestions} pertanyaan singkat`,
      desc: "Pilihan ganda, isian singkat, dan beberapa cerita pengalamanmu.",
    },
    {
      icon: <Sparkles className="size-4" />,
      title: "6 pillar AI Readiness",
      desc: "Hasilnya kami pakai untuk menyusun fokus belajar yang pas buatmu.",
    },
  ];

  return (
    <PageContainerSVP className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Full-page background image */}
      <Image
        src="https://www.hutamakarya.com/storage/whatsapp-image-2024-06-20-at-45600-pm-1.jpeg"
        alt=""
        fill
        priority
        aria-hidden
        className="pointer-events-none z-0 object-cover"
      />
      {/* Dark overlay for contrast */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-black/50"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col py-12">
        <div className="rounded-2xl border bg-white p-8 shadow-xl dark:border-dashboard-border dark:bg-card-1 dark:shadow-[0_0_18px_rgba(239,68,68,0.08)]">
          <div className="mb-7 flex justify-center">
            <Image
              src="https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-danantara.webp"
              alt="Hutama Karya × Danantara"
              width={400}
              height={120}
              className="h-12 w-auto object-contain dark:hidden"
            />
            <Image
              src="https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/logo-hk-danantara-white.webp"
              alt="Hutama Karya × Danantara"
              width={400}
              height={120}
              className="hidden h-12 w-auto object-contain dark:block"
            />
          </div>
          <h1 className="text-center text-3xl font-bold leading-tight text-gray-900 dark:text-white">
            Halo {firstName}, selamat datang 👋
          </h1>
          <p className="mt-3 text-center text-base leading-7 text-gray-600 dark:text-gray-300">
            Sebelum mulai belajar, isi dulu <b>AI Readiness Pre-Assessment</b>{" "}
            ini supaya kami paham titik berangkatmu dan bisa menyiapkan jalur
            belajar yang paling relevan.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {points.map((point) => (
              <div
                key={point.title}
                className="flex items-start gap-3 rounded-xl border border-dashboard-border bg-gray-50/60 p-4 dark:bg-card-2"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-500/15 dark:text-red-400">
                  {point.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {point.title}
                  </div>
                  <p className="mt-0.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
            Jawaban hanya bisa dikirim <b>satu kali</b> dan tidak bisa diubah
            setelahnya
          </div>

          <ButtonAILN
            variant="primary"
            onClick={onStart}
            className="mt-6 w-full"
          >
            Mulai Assessment
            <ArrowRight className="size-4" />
          </ButtonAILN>
        </div>
      </div>
    </PageContainerSVP>
  );
}

function QuestionBody({
  question,
  value,
  onSelectSingle,
  onToggleMulti,
  onTextChange,
}: {
  question: PreAssessmentQuestion;
  value: AnswerValue;
  onSelectSingle: (code: string) => void;
  onToggleMulti: (label: string) => void;
  onTextChange: (value: string) => void;
}) {
  if (question.type === "single") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pilih satu jawaban yang paling tepat.
        </p>
        {question.options.map((opt, idx) => {
          const code = question.valueCodes[idx];
          const selected = value === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onSelectSingle(code)}
              className={`flex items-center gap-3 rounded-lg border-[1.5px] px-4 py-3 text-left text-sm transition ${
                selected
                  ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-white dark:shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                  : "border-dashboard-border bg-white hover:border-black/30 hover:bg-gray-50 dark:bg-card-1 dark:text-gray-200 dark:hover:border-red-500/30 dark:hover:bg-card-2"
              }`}
            >
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  selected
                    ? "bg-emerald-500 text-white dark:shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    : "bg-gray-200 text-gray-700 dark:bg-dashboard-border dark:text-gray-300"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "multi") {
    const arr = (value as string[] | null) ?? [];
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pilih semua jawaban yang sesuai (boleh lebih dari satu).
        </p>
        {question.options.map((opt) => {
          const selected = arr.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggleMulti(opt)}
              className={`flex items-center gap-3 rounded-lg border-[1.5px] px-4 py-3 text-left text-sm transition ${
                selected
                  ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-white dark:shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                  : "border-dashboard-border bg-white hover:border-black/30 hover:bg-gray-50 dark:bg-card-1 dark:text-gray-200 dark:hover:border-red-500/30 dark:hover:bg-card-2"
              }`}
            >
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                  selected
                    ? "bg-emerald-500 text-white dark:shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    : "border border-gray-300 bg-white text-gray-700 dark:border-dashboard-border dark:bg-card-1 dark:text-gray-300"
                }`}
              >
                {selected ? "✓" : ""}
              </div>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "short") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tuliskan jawaban singkat.
        </p>
        <input
          type="text"
          value={(value as string | null) ?? ""}
          onChange={(e) => onTextChange(e.target.value)}
          maxLength={255}
          placeholder={question.placeholder}
          className="w-full rounded-lg border border-dashboard-border px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none dark:bg-card-1 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-500/60 dark:focus:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tuliskan jawabanmu dengan lebih lengkap.
      </p>
      <textarea
        value={(value as string | null) ?? ""}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={question.placeholder}
        rows={6}
        className="w-full resize-none rounded-lg border border-dashboard-border px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none dark:bg-card-1 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-500/60 dark:focus:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
      />
    </div>
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
