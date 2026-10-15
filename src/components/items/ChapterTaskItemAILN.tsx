"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import { TaskVariant } from "@/lib/app-types";
import { useProjectId } from "@/lib/use-project-id";
import {
  faBookOpen,
  faCirclePlay,
  faClipboardCheck,
  faClipboardList,
  faCommentDots,
  faLock,
  faSquareCheck,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDurationFromSeconds } from "@/lib/date-time-manipulation";
import AlertConfirmDialogAILN from "../modals/AlertConfirmDialogAILN";
import ChapterSurveyModalAILN from "../modals/ChapterSurveyModalAILN";

const QUIZ_DURATION_MINUTES = 20;

interface Quiz {
  id: string;
  name: string;
  attempts: number;
  best_score: number | null;
  question_count: number;
  xp_reward: number;
  xp_earned: number;
  active_attempt_started_at: string | null;
}

interface Video {
  id: number;
  title: string;
  completed: boolean;
  video_url: string;
  xp_reward: number;
  xp_earned: number;
}

interface Material {
  id: string;
  title: string;
  completed: boolean;
  xp_reward: number;
}

interface ChapterTest {
  id: number;
  name: string;
  submitted: boolean;
  score: number | null;
}

interface Survey {
  chapterId: number;
  submitted: boolean;
}

const variantStyles: Record<
  TaskVariant,
  { icon: React.ReactNode; badge: string }
> = {
  Quiz: {
    icon: <FontAwesomeIcon icon={faSquareCheck} size="xl" />,
    badge: "Quiz",
  },
  Video: {
    icon: <FontAwesomeIcon icon={faCirclePlay} size="xl" />,
    badge: "Recording",
  },
  Material: {
    icon: <FontAwesomeIcon icon={faBookOpen} size="xl" />,
    badge: "Materi",
  },
  PreTest: {
    icon: <FontAwesomeIcon icon={faClipboardList} size="xl" />,
    badge: "Pre-test",
  },
  PostTest: {
    icon: <FontAwesomeIcon icon={faClipboardCheck} size="xl" />,
    badge: "Post-test",
  },
  Survey: {
    icon: <FontAwesomeIcon icon={faCommentDots} size="xl" />,
    badge: "Survei",
  },
};

type ChapterTaskItemAILNProps =
  | {
      variant: "Quiz";
      unlocked: boolean;
      quiz: Quiz;
      lockedMessage?: string;
      isNext?: boolean;
    }
  | {
      variant: "Video";
      unlocked: boolean;
      video: Video;
      lockedMessage?: string;
      isNext?: boolean;
    }
  | {
      variant: "Material";
      unlocked: boolean;
      material: Material;
      lockedMessage?: string;
      isNext?: boolean;
    }
  | {
      variant: "PreTest";
      unlocked: boolean;
      test: ChapterTest;
      lockedMessage?: string;
      isNext?: boolean;
    }
  | {
      variant: "PostTest";
      unlocked: boolean;
      test: ChapterTest;
      lockedMessage?: string;
      isNext?: boolean;
    }
  | {
      variant: "Survey";
      unlocked: boolean;
      survey: Survey;
      lockedMessage?: string;
      isNext?: boolean;
      onSurveySuccess?: () => void;
    };

export default function ChapterTaskItemAILN(props: ChapterTaskItemAILNProps) {
  const projectId = useProjectId();
  const style = variantStyles[props.variant];
  const router = useRouter();
  const [isStartQuizDialogOpen, setIsStartQuizDialogOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const activeAttemptStartedAt =
    props.variant === "Quiz" ? props.quiz.active_attempt_started_at : null;
  const [activeAttemptSecondsLeft, setActiveAttemptSecondsLeft] = useState<
    number | null
  >(null);

  // Live countdown for an in-progress quiz attempt, derived from started_at + the 20-minute limit.
  useEffect(() => {
    if (!activeAttemptStartedAt) {
      queueMicrotask(() => setActiveAttemptSecondsLeft(null));
      return;
    }

    const tick = () => {
      const elapsed = dayjs().diff(dayjs(activeAttemptStartedAt), "second");
      setActiveAttemptSecondsLeft(
        Math.max(0, QUIZ_DURATION_MINUTES * 60 - elapsed),
      );
    };

    queueMicrotask(tick);
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeAttemptStartedAt]);

  const lockedText = props.lockedMessage ?? "Locked";

  let title = "";
  let meta = "";
  let statusVariant: GeneralLabelVariantAILN = "white";
  let xpReward: number | null = 0;
  let hasMark = false;
  let cta: React.ReactNode = null;

  if (props.variant === "Quiz") {
    const q = props.quiz;
    const hasAttempt = q.attempts > 0;
    const hasActiveAttempt = !!q.active_attempt_started_at;
    const timeIsUp = activeAttemptSecondsLeft === 0;
    const isActiveAndRunning = hasActiveAttempt && !timeIsUp;
    // Countdown hit 00:00 but this list hasn't refetched attempts yet — treat it as done already.
    const timedOutWithoutRecord = hasActiveAttempt && timeIsUp && !hasAttempt;
    title = q.name;
    xpReward = q.xp_reward;
    hasMark = hasAttempt;
    meta = !props.unlocked
      ? lockedText
      : isActiveAndRunning
        ? "Sedang dikerjakan"
        : timedOutWithoutRecord
          ? "Waktu habis"
          : !hasAttempt
            ? "Not taken yet"
            : `Score: ${q.best_score}%`;
    statusVariant = !props.unlocked
      ? "white"
      : isActiveAndRunning
        ? "blue"
        : timedOutWithoutRecord
          ? "yellow"
          : !hasAttempt
            ? "blue"
            : "green";
    cta = !props.unlocked ? (
      <ButtonAILN size="small" disabled width="full">
        Locked
      </ButtonAILN>
    ) : isActiveAndRunning ? (
      <ButtonAILN asChild variant="lime" size="small" width="full">
        <Link href={`/${projectId}/student/quizzes/${props.quiz.id}`}>
          Lanjutkan Quiz (
          {activeAttemptSecondsLeft !== null
            ? getDurationFromSeconds(activeAttemptSecondsLeft)
            : "..."}
          )
        </Link>
      </ButtonAILN>
    ) : hasAttempt || timedOutWithoutRecord ? (
      <ButtonAILN asChild variant="forest" size="small" width="full">
        <Link href={`/${projectId}/student/quizzes/${props.quiz.id}`}>
          Lihat Hasil
        </Link>
      </ButtonAILN>
    ) : (
      <ButtonAILN
        variant="forest"
        size="small"
        width="full"
        onClick={() => setIsStartQuizDialogOpen(true)}
      >
        Mulai Quiz
      </ButtonAILN>
    );
  } else if (props.variant === "Video") {
    const v = props.video;
    title = v.title;
    xpReward = v.xp_reward;
    hasMark = v.completed;
    meta = !props.unlocked
      ? lockedText
      : v.completed
        ? "Watched"
        : "Not watched yet";
    statusVariant = !props.unlocked ? "white" : v.completed ? "green" : "blue";
    cta = !props.unlocked ? (
      <ButtonAILN size="small" disabled width="full">
        Locked
      </ButtonAILN>
    ) : (
      <ButtonAILN asChild variant="forest" size="small" width="full">
        <Link href={`/${projectId}/student/videos/${props.video.id}`}>
          Lihat Recording
        </Link>
      </ButtonAILN>
    );
  } else if (props.variant === "PreTest" || props.variant === "PostTest") {
    const t = props.test;
    const label = props.variant === "PreTest" ? "Pre-test" : "Post-test";
    title = t.name;
    xpReward = null;
    hasMark = t.submitted;
    meta = !props.unlocked
      ? lockedText
      : !t.submitted
        ? "Not taken yet"
        : t.score !== null
          ? `Score: ${t.score}%`
          : "Terkirim";
    statusVariant = !props.unlocked ? "white" : t.submitted ? "green" : "blue";
    cta = !props.unlocked ? (
      <ButtonAILN size="small" disabled width="full">
        Locked
      </ButtonAILN>
    ) : (
      <ButtonAILN asChild variant="forest" size="small" width="full">
        <Link href={`/${projectId}/student/chapter-tests/${t.id}`}>
          {t.submitted ? "Lihat Hasil" : `Mulai ${label}`}
        </Link>
      </ButtonAILN>
    );
  } else if (props.variant === "Survey") {
    const sv = props.survey;
    title = "Survei kepuasan chapter";
    xpReward = null;
    hasMark = sv.submitted;
    meta = !props.unlocked
      ? lockedText
      : sv.submitted
        ? "Terkirim"
        : "Belum diisi";
    statusVariant = !props.unlocked ? "white" : sv.submitted ? "green" : "blue";
    cta = !props.unlocked ? (
      <ButtonAILN size="small" disabled width="full">
        Locked
      </ButtonAILN>
    ) : (
      <ButtonAILN
        variant="forest"
        size="small"
        width="full"
        onClick={() => setIsSurveyOpen(true)}
      >
        {sv.submitted ? "Lihat Jawaban" : "Isi Survei"}
      </ButtonAILN>
    );
  } else {
    const m = props.material;
    title = m.title;
    xpReward = m.xp_reward;
    hasMark = m.completed;
    meta = !props.unlocked ? lockedText : m.completed ? "Read" : "Not started";
    statusVariant = !props.unlocked ? "white" : m.completed ? "green" : "blue";

    cta = !props.unlocked ? (
      <ButtonAILN size="small" disabled width="full">
        Locked
      </ButtonAILN>
    ) : (
      <ButtonAILN asChild variant="forest" size="small" width="full">
        <Link
          href={`/${projectId}/student/materials/${props.material.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Baca Materi
        </Link>
      </ButtonAILN>
    );
  }

  const locked = !props.unlocked;

  const isNext = !!props.isNext && !locked && !hasMark;
  const quizQuestionCount =
    props.variant === "Quiz" ? props.quiz.question_count : 0;
  const quizId = props.variant === "Quiz" ? props.quiz.id : "";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        locked
          ? "border-dashboard-border bg-card-2 opacity-60"
          : isNext
            ? "ailn-ring-pulse border-claude/50 bg-hijau-t ring-2 ring-claude/30 dark:border-claude/30 dark:bg-claude/10 dark:ring-claude/60"
            : "border-dashboard-border bg-card-2"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          locked
            ? "bg-gray-100 text-gray-400 dark:bg-claude/5 dark:text-claude/40"
            : "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright"
        }`}
      >
        {style.icon}
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {style.badge}
        </div>
        <div className="text-[15px] font-medium dark:text-white">{title}</div>
        <div className="mt-1 flex items-center gap-2">
          {xpReward !== null && (
            <GeneralLabelAILN
              variant="white"
              icon={
                <FontAwesomeIcon
                  icon={faStar}
                  className="h-3 w-3 text-warning dark:text-amber-400"
                />
              }
            >
              {xpReward} XP
            </GeneralLabelAILN>
          )}
          <GeneralLabelAILN variant={statusVariant}>{meta}</GeneralLabelAILN>
          {isNext && (
            <GeneralLabelAILN variant="red">Lanjutkan</GeneralLabelAILN>
          )}
        </div>
      </div>
      <div className="w-40 shrink-0">{cta}</div>
      <div className="w-6">
        {locked ? (
          <FontAwesomeIcon
            icon={faLock}
            className="h-4 w-4 text-gray-400 dark:text-claude/40"
          />
        ) : hasMark ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-bright text-forest-deep">
            <Check className="size-3.5" />
          </span>
        ) : (
          <span className="block h-4 w-4 rounded-full border-2 border-gray-300 dark:border-claude/40" />
        )}
      </div>
      {props.variant === "Quiz" && (
        <AlertConfirmDialogAILN
          isOpen={isStartQuizDialogOpen}
          alertDialogHeader="Mulai Quiz Sekarang?"
          alertDialogMessage={`Quiz ini terdiri dari ${quizQuestionCount} pertanyaan dengan total waktu ${QUIZ_DURATION_MINUTES} menit. Waktu akan terus berjalan setelah quiz dimulai dan tidak bisa di-pause walaupun kamu keluar halaman.`}
          alertCancelLabel="Batal"
          alertConfirmLabel="Mulai sekarang"
          onClose={() => setIsStartQuizDialogOpen(false)}
          onConfirm={() => {
            setIsStartQuizDialogOpen(false);
            router.push(`/${projectId}/student/quizzes/${quizId}`);
          }}
        />
      )}
      {props.variant === "Survey" && (
        <ChapterSurveyModalAILN
          chapterId={props.survey.chapterId}
          isOpen={isSurveyOpen}
          onClose={() => setIsSurveyOpen(false)}
          onSuccess={props.onSurveySuccess}
        />
      )}
    </div>
  );
}
