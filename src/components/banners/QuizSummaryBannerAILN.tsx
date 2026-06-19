"use client";

import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import {
  faBullseye,
  faCircleCheck,
  faCircleXmark,
  faCrown,
  faFileLines,
  faStar,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

const PASS_THRESHOLD = 70;
const TROPHY_URL =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/piala-ciki.png";

interface QuizSummaryBannerAILNProps {
  accuracy: number;
  correctCount: number;
  score: number;
  totalQuestions: number;
  wrongCount: number;
  xpEarned: number;
}

export default function QuizSummaryBannerAILN({
  accuracy,
  correctCount,
  score,
  totalQuestions,
  wrongCount,
  xpEarned,
}: QuizSummaryBannerAILNProps) {
  const passed = score >= PASS_THRESHOLD;

  return (
    <section className="relative overflow-hidden rounded-xl border border-dashboard-border bg-gradient-to-br from-white via-emerald-50/35 to-amber-50/40 p-5 dark:bg-card-1 dark:from-card-1 dark:via-emerald-500/10 dark:to-amber-500/10">
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-56 bg-gradient-to-br from-amber-300/25 via-emerald-300/15 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-64 bg-gradient-to-tr from-emerald-300/20 via-amber-200/15 to-transparent blur-2xl" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_auto_minmax(13rem,0.8fr)_auto_minmax(0,1.25fr)] lg:items-center">
        <div className="flex min-w-0 items-center gap-5">
          <div className="relative hidden size-32 shrink-0 sm:block">
            <Image
              src={TROPHY_URL}
              alt="Trophy quiz"
              fill
              sizes="128px"
              className="object-contain drop-shadow-[0_18px_28px_rgba(245,158,11,0.22)]"
            />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Skor Kamu
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="text-6xl font-black leading-none tracking-normal text-gray-950 dark:text-white">
                {score}
              </span>
              <ScoreStars score={score} />
            </div>
            <p className="mt-2 text-xl font-black text-emerald-700 dark:text-emerald-300">
              {motivationalMessage(score)}
            </p>
            {xpEarned > 0 && (
              <GeneralLabelAILN
                variant="yellow"
                icon={<FontAwesomeIcon icon={faStar} className="h-3 w-3" />}
                className="mt-4"
              >
                +{xpEarned} XP diperoleh
              </GeneralLabelAILN>
            )}
          </div>
        </div>

        <VerticalDivider />

        <div className="flex flex-col items-center justify-center gap-4">
          <GreenGauge correct={correctCount} total={totalQuestions} />
          <GeneralLabelAILN
            variant={passed ? "green" : "yellow"}
            icon={<FontAwesomeIcon icon={faBullseye} className="h-3 w-3" />}
          >
            {passed ? "Hasil Lulus" : "Perlu Latihan Lagi"}
          </GeneralLabelAILN>
        </div>

        <VerticalDivider />

        <div className="min-w-0">
          <h2 className="text-lg font-black text-gray-950 dark:text-white">
            Ringkasan Performa
          </h2>
          <div className="mt-4 grid gap-2">
            <SummaryRow
              icon={faFileLines}
              label="Total Pertanyaan"
              value={totalQuestions}
              iconClassName="text-blue-500"
            />
            <SummaryRow
              icon={faCircleCheck}
              label="Benar"
              value={correctCount}
              iconClassName="text-emerald-600"
              valueClassName="text-emerald-700 dark:text-emerald-300"
            />
            <SummaryRow
              icon={faCircleXmark}
              label="Salah"
              value={wrongCount}
              iconClassName="text-red-600"
              valueClassName="text-red-600 dark:text-red-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function motivationalMessage(score: number): string {
  if (score === 100) return "Sempurna! Luar biasa";
  if (score >= 80) return "Bagus sekali";
  if (score >= 70) return "Lulus, terus semangat";
  if (score >= 50) return "Hampir, pelajari lagi";
  return "Pelajari lagi materinya";
}

function ScoreStars({ score }: { score: number }) {
  const activeStars = Math.min(5, Math.max(1, Math.ceil(score / 20)));

  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <FontAwesomeIcon
          key={index}
          icon={faStar}
          className={`h-4 w-4 ${
            index < activeStars
              ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.45)]"
              : "text-gray-200 dark:text-gray-700"
          }`}
        />
      ))}
    </span>
  );
}

function GreenGauge({ correct, total }: { correct: number; total: number }) {
  const radius = 72;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const ratio = total > 0 ? correct / total : 0;
  const offset = circumference * (1 - ratio);
  const size = radius * 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="rgba(16,185,129,0.14)"
          strokeWidth={stroke}
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="rgb(16,185,129)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth={stroke}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <FontAwesomeIcon
          icon={faCrown}
          className="mb-2 h-7 w-7 text-amber-400"
        />
        <span className="text-3xl font-black leading-none text-gray-950 dark:text-white">
          {correct}/{total}
        </span>
        <span className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          Benar
        </span>
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  iconClassName,
  label,
  value,
  valueClassName = "text-gray-950 dark:text-white",
}: {
  icon: IconDefinition;
  iconClassName: string;
  label: string;
  value: number | string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-dashboard-border bg-white/80 px-4 py-3 dark:bg-card-1/70">
      <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${iconClassName}`} />
        <span className="truncate">{label}</span>
      </span>
      <span className={`text-sm font-black ${valueClassName}`}>{value}</span>
    </div>
  );
}

function VerticalDivider() {
  return (
    <div className="hidden h-full min-h-44 w-px bg-gradient-to-b from-transparent via-dashboard-border to-transparent lg:block" />
  );
}
