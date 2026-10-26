"use client";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import { useStudentIdentity } from "@/contexts/StudentIdentityContext";
import {
  browserDraftKey,
  readBrowserDraft,
  writeBrowserDraft,
} from "@/lib/browser-draft";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import PageContainerSVP from "@/components/pages/PageContainerSVP";
import { CheckSession } from "@/lib/actions";
import { useProjectId } from "@/lib/use-project-id";
import {
  PRE_ASSESSMENT_SECTIONS,
  PRE_ASSESSMENT_TEXT_MAX,
} from "@/lib/pre-assessment";
import type {
  PreAssessmentAnswer,
  PreAssessmentItem,
  PreAssessmentQuestions,
} from "@/apis/pre-assessment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRight, BookOpen, Clock3, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

// Keyed by item id: an option id for single_choice, the typed text for text items.
type AnswerMap = Record<number, number | string>;

// The version name carries internal labels ("Form A"), so learners see one fixed title.
const PRE_ASSESSMENT_TITLE = "Pre-Assessment AI Proficiency";

function isAnswered(item: PreAssessmentItem, answers: AnswerMap): boolean {
  const value = answers[item.id];
  if (item.type === "single_choice") return typeof value === "number";
  return typeof value === "string" && value.trim().length > 0;
}

function toPayload(
  items: PreAssessmentItem[],
  answers: AnswerMap,
): PreAssessmentAnswer[] {
  return items.map((item) =>
    item.type === "single_choice"
      ? { item_id: item.id, option_id: answers[item.id] as number }
      : { item_id: item.id, text: String(answers[item.id]).trim() },
  );
}

// No server autosave exists, so an unsent draft lives in this browser only.
function readDraft(key: string): AnswerMap {
  try {
    return readBrowserDraft<AnswerMap>(window.localStorage, key) ?? {};
  } catch {
    return {};
  }
}
function writeDraft(key: string, answers: AnswerMap | null) {
  try {
    writeBrowserDraft(window.localStorage, key, answers);
    return true;
  } catch {
    return false;
  }
}

export default function PreAssessmentAILN({
  questions,
}: {
  questions: PreAssessmentQuestions;
}) {
  const { version, items } = questions;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const projectId = useProjectId();
  const router = useRouter();
  const userId = useStudentIdentity();
  const key = browserDraftKey(
    userId ?? "",
    projectId,
    `pre-assessment:${version.id}`,
  );
  const [draftWarning, setDraftWarning] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "submitting" | "scoring">("idle");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const draft = readDraft(key);
    setAnswers(
      Object.fromEntries(
        items.flatMap((item) => {
          const answer = draft[item.id];
          return item.type === "single_choice"
            ? item.options.some((option) => option.id === answer)
              ? [[item.id, answer]]
              : []
            : typeof answer === "string"
              ? [[item.id, answer.slice(0, PRE_ASSESSMENT_TEXT_MAX)]]
              : [];
        }),
      ),
    );
  }, [key, items]);

  useEffect(() => {
    if (mounted && userId) {
      const saved = writeDraft(key, answers);
      queueMicrotask(() => setDraftWarning(!saved));
    }
  }, [mounted, key, answers, userId]);

  const isDark = mounted && resolvedTheme === "dark";
  const nextVariant = isDark ? "neutral" : "dark";

  const totalQuestions = items.length;
  const currentItem = items[currentIdx];

  const answeredCount = useMemo(
    () => items.filter((item) => isAnswered(item, answers)).length,
    [items, answers],
  );
  const missing = useMemo(
    () => items.filter((item) => !isAnswered(item, answers)),
    [items, answers],
  );

  if (!started) {
    return (
      <PreAssessmentWelcomeAILN
        questions={questions}
        hasDraft={answeredCount > 0}
        onStart={() => {
          const firstOpen = items.findIndex((i) => !isAnswered(i, answers));
          setCurrentIdx(firstOpen === -1 ? 0 : firstOpen);
          setStarted(true);
        }}
      />
    );
  }

  const setAnswer = (value: number | string | null) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === null || value === "") delete next[currentItem.id];
      else next[currentItem.id] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    setConfirmSubmit(false);
    if (phase !== "idle") return;
    if (missing.length > 0) {
      toast.error(`Masih ada ${missing.length} pertanyaan yang belum dijawab.`);
      setCurrentIdx(items.indexOf(missing[0]));
      return;
    }

    setPhase("submitting");
    try {
      const res = await fetch("/api/pre-assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          answers: toPayload(items, answers),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message ?? "Gagal mengirim pre-assessment.");
        setPhase("idle");
        return;
      }
      writeDraft(key, null);

      // Grading runs on the first score call; a failure here is retried from the report page.
      setPhase("scoring");
      await fetch("/api/pre-assessment/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      }).catch(() => null);
      router.refresh();
    } catch {
      toast.error("Gagal menghubungi server. Coba lagi.");
      setPhase("idle");
    }
  };

  if (phase === "scoring") return <PreAssessmentScoringAILN />;

  const handlePrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const handleNext = () =>
    setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1));

  const isLast = currentIdx === totalQuestions - 1;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);
  const section = PRE_ASSESSMENT_SECTIONS[currentItem.section];

  return (
    <PageContainerSVP className="flex min-h-screen justify-center">
      <AlertConfirmDialogAILN
        isOpen={confirmSubmit}
        alertDialogHeader="Kirim pre-assessment?"
        alertDialogMessage={`${answeredCount} dari ${totalQuestions} pertanyaan terjawab. Jawaban hanya dapat dikirim satu kali dan tidak dapat diubah setelahnya.`}
        alertCancelLabel="Cek lagi"
        alertConfirmLabel="Kirim sekarang"
        onClose={() => setConfirmSubmit(false)}
        onConfirm={() => void handleSubmit()}
      />
      <div className="flex w-full flex-col gap-4 my-10">
        <p role="status" className="text-sm text-muted-foreground">
          {draftWarning
            ? "Draft belum tersimpan. Biarkan halaman terbuka dan coba lagi sebelum keluar."
            : "Draft tersimpan di browser ini untuk akunmu, belum terkirim."}
        </p>
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 dark:border-dashboard-border dark:bg-card-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <h1 className="text-base font-medium dark:text-white">
                {PRE_ASSESSMENT_TITLE}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Jawab sesuai kebiasaanmu sekarang, bukan jawaban yang menurutmu
                ideal. Jawaban hanya bisa dikirim satu kali.
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-dashboard-border dark:text-gray-300">
              Soal {currentIdx + 1} / {totalQuestions}
            </span>
            <span className="rounded-full bg-hijau-t px-3 py-1 text-xs font-medium text-claude dark:bg-claude/10 dark:text-lime-bright dark:border dark:border-claude/40">
              {answeredCount} / {totalQuestions} terjawab ({progressPct}%)
            </span>
          </div>
          <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
            {items.map((item) => (
              <div
                key={item.id}
                className={`h-full flex-1 ${
                  isAnswered(item, answers)
                    ? "bg-claude"
                    : "bg-gray-200 dark:bg-dashboard-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main body */}
        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          {/* Left: question */}
          <div className="flex flex-1 flex-col gap-4 rounded-lg border bg-white p-4 sm:p-6 dark:border-dashboard-border dark:bg-card-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
                SOAL {currentIdx + 1}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${section.badge}`}
              >
                {section.label}
              </span>
            </div>

            <p
              id={`pre-assessment-question-${currentItem.id}`}
              className="whitespace-pre-line text-[17px] font-medium leading-snug text-gray-900 dark:text-white"
            >
              {currentItem.question}
            </p>

            <QuestionBody
              item={currentItem}
              value={answers[currentItem.id]}
              hint={section.hint}
              onChange={setAnswer}
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
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 dark:border-dashboard-border dark:bg-card-1">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
                NAVIGASI
              </span>
              <div className="grid grid-cols-7 gap-1.5">
                {items.map((item, idx) => {
                  const isCurrent = idx === currentIdx;
                  const ans = isAnswered(item, answers);

                  return (
                    <ButtonAILN
                      variant={
                        isCurrent
                          ? "questionCurrent"
                          : ans
                            ? "questionAnswered"
                            : "question"
                      }
                      size="question"
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      aria-label={`Soal ${idx + 1}, ${ans ? "terjawab" : "belum dijawab"}`}
                      aria-current={isCurrent ? "step" : undefined}
                      title={PRE_ASSESSMENT_SECTIONS[item.section].label}
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
                <LegendItem color="bg-claude" label="Saat ini" />
                <LegendItem
                  color="bg-gray-100 border border-dashboard-border dark:bg-card-2"
                  label="Belum"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border bg-white p-4 dark:border-dashboard-border dark:bg-card-1">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
                STATUS
              </span>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Terjawab
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Belum dijawab
                </span>
                <span
                  className={`font-medium ${
                    missing.length === 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {missing.length}
                </span>
              </div>
            </div>

            <ButtonAILN
              type="button"
              variant="dark"
              width="full"
              onClick={() => setConfirmSubmit(true)}
              disabled={phase !== "idle" || missing.length > 0}
            >
              {phase === "submitting" ? "Mengirim..." : "Kirim Jawaban"}
            </ButtonAILN>
          </div>
        </div>
      </div>
    </PageContainerSVP>
  );
}

function PreAssessmentWelcomeAILN({
  questions,
  hasDraft,
  onStart,
}: {
  questions: PreAssessmentQuestions;
  hasDraft: boolean;
  onStart: () => void;
}) {
  const userQ = useQuery({ queryKey: ["session"], queryFn: CheckSession });
  const firstName = userQ.data?.user?.full_name?.split(" ")[0] ?? "teman";
  const { version, items } = questions;

  const points = [
    {
      icon: <BookOpen className="size-4" />,
      title: `${items.length} pertanyaan`,
      desc: "Profil singkat, skenario kerja, satu latihan menulis prompt, dan kebiasaanmu memakai AI.",
    },
    {
      icon: <Clock3 className="size-4" />,
      title: `Sekitar ${version.duration_minutes} menit`,
      desc: "Tidak ada batas waktu. Jawabanmu tersimpan di browser ini sampai kamu kirim.",
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
        <div className="rounded-lg border bg-white p-8 shadow-xl dark:border-dashboard-border dark:bg-card-1">
          <h1 className="text-center text-3xl font-medium leading-tight text-gray-900 dark:text-white">
            Halo {firstName}, selamat datang 👋
          </h1>
          <p className="mt-3 text-center text-base leading-7 text-gray-600 dark:text-gray-300">
            Sebelum mulai belajar, isi dulu <b>{PRE_ASSESSMENT_TITLE}</b> supaya
            kami paham titik berangkatmu dan bisa menyiapkan alur belajar yang
            paling relevan.
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-lg border border-dashboard-border p-4">
            <Image
              src="/images/logo-cfte.webp"
              alt="CFTE"
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-lg"
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Berstandar CFTE AI Proficiency Framework
              </div>
              <p className="mt-0.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Soal dan penilaiannya mengacu pada kerangka AI Proficiency dari
                CFTE: 10 domain kompetensi, dengan hasil berupa band 0–5.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {points.map((point) => (
              <div
                key={point.title}
                className="flex items-start gap-3 rounded-lg border border-dashboard-border bg-gray-50/60 p-4 dark:bg-card-2"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright">
                  {point.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {point.title}
                  </div>
                  <p className="mt-0.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
            Semua pertanyaan wajib dijawab, dan jawaban hanya bisa dikirim{" "}
            <b>satu kali</b>.
          </div>

          <div className="mt-6">
            <ButtonAILN variant="dark" onClick={onStart} width="full">
              {hasDraft ? "Lanjutkan Assessment" : "Mulai Assessment"}
              <ArrowRight className="size-4" />
            </ButtonAILN>
          </div>
        </div>
      </div>
    </PageContainerSVP>
  );
}

function PreAssessmentScoringAILN() {
  return (
    <PageContainerSVP className="flex min-h-screen items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-lg border bg-white p-8 text-center dark:border-dashboard-border dark:bg-card-1">
        <Loader2 className="size-6 animate-spin text-claude dark:text-lime-bright" />
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">
          Jawabanmu sudah terkirim
        </h1>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          Kami sedang menilai jawaban tertulismu dan menyusun hasilnya. Biasanya
          hanya beberapa detik.
        </p>
      </div>
    </PageContainerSVP>
  );
}

function QuestionBody({
  item,
  value,
  hint,
  onChange,
}: {
  item: PreAssessmentItem;
  value: number | string | undefined;
  hint: string;
  onChange: (value: number | string | null) => void;
}) {
  if (item.type === "single_choice") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
        {item.options.map((opt, idx) => {
          const selected = value === opt.id;
          return (
            <ButtonAILN
              aria-pressed={selected}
              variant={selected ? "optionActive" : "option"}
              size="option"
              width="full"
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
            >
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  selected
                    ? "bg-sevenpreneur-coal text-white dark:bg-white dark:text-sevenpreneur-coal"
                    : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1">{opt.text}</span>
            </ButtonAILN>
          );
        })}
      </div>
    );
  }

  const text = typeof value === "string" ? value : "";
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      <TextAreaAILN
        textAreaId={`pre-assessment-answer-${item.id}`}
        aria-labelledby={`pre-assessment-question-${item.id}`}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        maxLength={PRE_ASSESSMENT_TEXT_MAX}
        rows={item.section === "practice" ? 10 : 6}
      />
      <span className="self-end text-xs text-gray-400">
        {text.length} / {PRE_ASSESSMENT_TEXT_MAX}
      </span>
    </div>
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
