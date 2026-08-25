"use client";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import {
  faPuzzlePiece,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock,
  MessageSquare,
  Send,
} from "lucide-react";
import Link from "next/link";

dayjs.locale("id");

export type PracticeKind = "PROMPT" | "USE_CASE";

export type PracticeStatus =
  | "PENDING_SUBMIT"
  | "AWAITING_REVIEW"
  | "NEEDS_REVISION"
  | "ACCEPTED";

export interface Category {
  id: number;
  name: string;
}

const statusMeta: Record<
  PracticeStatus,
  { label: string; variant: GeneralLabelVariantAILN; icon: typeof CheckCircle2 }
> = {
  PENDING_SUBMIT: {
    label: "Belum dikerjakan",
    variant: "yellow",
    icon: Clock,
  },
  AWAITING_REVIEW: {
    label: "Menunggu review",
    variant: "blue",
    icon: Clock,
  },
  NEEDS_REVISION: {
    label: "Perlu revisi",
    variant: "red",
    icon: CircleAlert,
  },
  ACCEPTED: {
    label: "Diterima",
    variant: "green",
    icon: CheckCircle2,
  },
};

export default function SkillPracticeCardAILN({
  kind,
  title,
  body,
  levelNumber,
  categories,
  status,
  deadline,
  championName,
  message,
  submittedAt,
  href,
}: {
  kind: PracticeKind;
  title: string;
  body: string;
  levelNumber: number;
  categories: Category[];
  status: PracticeStatus;
  deadline: string | null;
  championName: string | null;
  message: string | null;
  submittedAt: string | null;
  href: string;
}) {
  const meta = statusMeta[status];
  const StatusIcon = meta.icon;
  const deadlineOverdue =
    status === "PENDING_SUBMIT" &&
    deadline !== null &&
    dayjs(deadline).isBefore(dayjs());
  const hasFooter = Boolean(
    deadline || submittedAt || championName || message || categories.length > 0
  );

  return (
    <Link
      href={href}
      className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <article className="flex min-h-64 flex-col gap-4 rounded-lg border border-dashboard-border bg-card-2 p-4 transition hover:border-hijau hover:bg-hijau-t/40 dark:hover:bg-claude/5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <GeneralLabelAILN variant="red">
              Level {levelNumber}
            </GeneralLabelAILN>
            <GeneralLabelAILN
              variant="white"
              icon={
                <FontAwesomeIcon
                  icon={kind === "PROMPT" ? faWandMagicSparkles : faPuzzlePiece}
                  className="size-3"
                />
              }
            >
              {kind === "PROMPT" ? "Prompt" : "Use Case"}
            </GeneralLabelAILN>
          </div>
          <GeneralLabelAILN
            variant={meta.variant}
            icon={<StatusIcon className="size-3" />}
            className="shrink-0"
          >
            {meta.label}
          </GeneralLabelAILN>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-base font-bold text-foreground dark:text-white">
            {title}
          </h3>
          <p className="text-sm leading-6 text-gray-500 line-clamp-3 dark:text-gray-400">
            {body}
          </p>
        </div>

        {hasFooter && (
          <div className="flex flex-col gap-2 border-t border-dashboard-border pt-3 text-xs text-gray-600 dark:text-gray-300 font-inter">
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="shrink-0 font-semibold text-gray-500 dark:text-gray-400">
                  Category:
                </span>
                {categories.map((category) => (
                  <GeneralLabelAILN key={category.id} variant="white">
                    {category.name}
                  </GeneralLabelAILN>
                ))}
              </div>
            )}
            {deadline && (
              <div className="flex items-center gap-2">
                <CalendarClock className="size-3.5 shrink-0" />
                <span
                  className={
                    deadlineOverdue
                      ? "font-semibold text-red-600 dark:text-red-400"
                      : ""
                  }
                >
                  Deadline: {dayjs(deadline).format("ddd, D MMM YYYY - HH:mm")}
                  {deadlineOverdue ? " (lewat)" : ""}
                </span>
              </div>
            )}
            {submittedAt && (
              <div className="flex items-center gap-2 font-inter">
                <Send className="size-3.5 shrink-0" />
                <span>
                  Submitted:{" "}
                  {dayjs(submittedAt).format("ddd, D MMM YYYY - HH:mm")}
                </span>
              </div>
            )}
            {championName && (
              <div className="flex items-center gap-2 font-inter">
                <BookOpen className="size-3.5 shrink-0" />
                <span>Dari: {championName}</span>
              </div>
            )}
            {message && (
              <div className="flex items-start gap-2 font-inter">
                <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
                <span className="italic line-clamp-2">
                  &ldquo;{message}&rdquo;
                </span>
              </div>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}
