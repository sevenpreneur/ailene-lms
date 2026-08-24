"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import {
  faLock,
  faPuzzlePiece,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Star,
  XCircle,
} from "lucide-react";
import { useProjectId } from "@/lib/use-project-id";
import Image from "next/image";
import Link from "next/link";

dayjs.locale("id");

export interface SkillPracticeItem {
  id: number;
  ref_id: number;
  level: { id: number; level_number: number; name: string };
  name: string;
  body: string;
  xp_reward: number;
  categories: { id: number; name: string }[];
  assigned_by: { id: number; full_name: string; avatar: string | null } | null;
  deadline: string | Date | null;
  message: string | null;
  submitted_at: string | Date | null;
  reviewed_at: string | Date | null;
  is_accepted: boolean;
}

export type SkillPracticeStatus =
  | "accepted"
  | "rejected"
  | "pending_review"
  | "overdue"
  | "todo";

export function deriveSkillPracticeStatus(
  item: SkillPracticeItem
): SkillPracticeStatus {
  // Source of truth for "sudah direview" adalah reviewed_at —
  // bukan is_accepted, karena is_accepted default false di DB
  // (lihat schema AilPromptSubmission / AilUseCaseSubmission).
  if (item.reviewed_at) {
    return item.is_accepted ? "accepted" : "rejected";
  }
  if (item.submitted_at) return "pending_review";
  if (item.deadline && dayjs(item.deadline).isBefore(dayjs(), "day"))
    return "overdue";
  return "todo";
}

const statusMeta: Record<
  SkillPracticeStatus,
  { label: string; variant: GeneralLabelVariantAILN; icon: React.ReactNode }
> = {
  accepted: {
    label: "Diterima",
    variant: "green",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  rejected: {
    label: "Perlu Revisi",
    variant: "red",
    icon: <XCircle className="size-3.5" />,
  },
  pending_review: {
    label: "Menunggu Review",
    variant: "yellow",
    icon: <Clock className="size-3.5" />,
  },
  overdue: {
    label: "Lewat Deadline",
    variant: "red",
    icon: <Clock className="size-3.5" />,
  },
  todo: {
    label: "Belum Dikerjakan",
    variant: "white",
    icon: <Clock className="size-3.5" />,
  },
};

type Variant = "Prompt" | "UseCase";

const variantMeta: Record<
  Variant,
  { icon: React.ReactNode; badge: string; basePath: string }
> = {
  Prompt: {
    icon: <FontAwesomeIcon icon={faWandMagicSparkles} size="lg" />,
    badge: "Prompt",
    basePath: "/student/skill-practice/prompts",
  },
  UseCase: {
    icon: <FontAwesomeIcon icon={faPuzzlePiece} size="lg" />,
    badge: "Use Case",
    basePath: "/student/skill-practice/use-cases",
  },
};

interface SkillPracticeItemAILNProps {
  variant: Variant;
  unlocked: boolean;
  item: SkillPracticeItem;
}

export default function SkillPracticeItemAILN(
  props: SkillPracticeItemAILNProps
) {
  const { variant, item, unlocked } = props;
  const projectId = useProjectId();
  const v = variantMeta[variant];
  const status = deriveSkillPracticeStatus(item);
  const sMeta = statusMeta[status];
  const locked = !unlocked;

  const ctaLabel =
    status === "accepted"
      ? "Lihat Feedback"
      : status === "rejected"
        ? "Revisi"
        : status === "pending_review"
          ? "Lihat Submission"
          : "Kerjakan";

  const cta = locked ? (
    <ButtonAILN size="small" disabled className="w-full">
      Locked
    </ButtonAILN>
  ) : (
    <Link href={`/${projectId}${v.basePath}/${item.ref_id}`} className="block">
      <ButtonAILN size="small" className="w-full">
        {ctaLabel}
      </ButtonAILN>
    </Link>
  );

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-dashboard-border p-3 ${
        locked ? "bg-card-2 opacity-60" : "bg-card-2"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
          locked
            ? "bg-gray-100 text-gray-400 dark:bg-claude/5 dark:text-claude/40"
            : "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
        }`}
      >
        {v.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {v.badge}
        </div>
        <div className="text-sm font-semibold dark:text-white line-clamp-1">
          {item.name}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <GeneralLabelAILN
            variant="white"
            icon={
              <Star
                className="size-3 text-warning dark:text-amber-400"
                fill="currentColor"
              />
            }
          >
            {item.xp_reward} XP
          </GeneralLabelAILN>
          <GeneralLabelAILN variant={sMeta.variant} icon={sMeta.icon}>
            {sMeta.label}
          </GeneralLabelAILN>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="size-3.5" />
            {item.deadline
              ? `Deadline ${dayjs(item.deadline).format("D MMM YYYY")}`
              : "Tanpa deadline"}
          </span>
          {item.assigned_by && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              {item.assigned_by.avatar ? (
                <Image
                  src={item.assigned_by.avatar}
                  alt={item.assigned_by.full_name}
                  width={16}
                  height={16}
                  className="size-4 rounded-full object-cover"
                />
              ) : (
                <div className="size-4 rounded-full bg-gray-200 dark:bg-white/10" />
              )}
              <span className="truncate max-w-[120px]">
                {item.assigned_by.full_name.split(" ")[0]}
              </span>
            </span>
          )}
        </div>
        {item.message && (
          <div className="mt-2 flex items-start gap-1.5 rounded bg-gray-50 px-2 py-1.5 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">
            <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-gray-400" />
            <span className="italic line-clamp-2">{item.message}</span>
          </div>
        )}
      </div>

      <div className="flex w-32 shrink-0 flex-col items-end gap-2">
        {cta}
        {locked && (
          <FontAwesomeIcon
            icon={faLock}
            className="h-4 w-4 text-gray-400 dark:text-claude/40"
          />
        )}
      </div>
    </div>
  );
}
