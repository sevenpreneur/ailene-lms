"use client";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { CalendarClock, Clock, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

// The three review states a champion can act on. PENDING_SUBMIT (student
// belum submit) sengaja tidak dimasukkan ke filter — belum ada yang direview.
export type ReviewStatus = "AWAITING_REVIEW" | "NEEDS_REVISION" | "ACCEPTED";

export interface SubmissionRow {
  id: number;
  kind: "PROMPT" | "USE_CASE";
  href: string;
  level_number: number;
  title: string;
  body: string;
  category: string | null;
  member: { id: number; full_name: string; avatar: string | null };
  deadline: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean;
  hours_saved: number | null;
  ai_tool: string | null;
}

export function deriveStatus(
  r: SubmissionRow
): ReviewStatus | "PENDING_SUBMIT" {
  if (r.is_accepted) return "ACCEPTED";
  if (!r.submitted_at) return "PENDING_SUBMIT";
  if (r.reviewed_at && dayjs(r.reviewed_at).isAfter(dayjs(r.submitted_at)))
    return "NEEDS_REVISION";
  return "AWAITING_REVIEW";
}

const STATUS_META: Record<
  ReviewStatus,
  { label: string; variant: GeneralLabelVariantAILN }
> = {
  AWAITING_REVIEW: { label: "Perlu review", variant: "blue" },
  NEEDS_REVISION: { label: "Menunggu revisi", variant: "red" },
  ACCEPTED: { label: "Diterima", variant: "green" },
};

const KIND_META: Record<
  SubmissionRow["kind"],
  { label: string; variant: GeneralLabelVariantAILN }
> = {
  PROMPT: { label: "Prompt", variant: "yellow" },
  USE_CASE: { label: "Use Case", variant: "green" },
};

const fmt = (d: string) =>
  dayjs(d).locale("id").format("ddd, D MMM YYYY · HH:mm");

export default function SubmissionItemChampion({ row }: { row: SubmissionRow }) {
  const status = deriveStatus(row);
  const meta = status === "PENDING_SUBMIT" ? null : STATUS_META[status];
  const kind = KIND_META[row.kind];

  return (
    <Link
      href={row.href}
      className="flex flex-col gap-2.5 rounded-lg border border-dashboard-border bg-card-1 p-4 transition hover:border-emerald-400 hover:bg-emerald-500/[0.04]"
    >
      {/* Top: member + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={row.member.avatar || DEFAULT_AVATAR}
            alt={row.member.full_name}
            width={28}
            height={28}
            className="size-7 rounded-full object-cover"
          />
          <span className="text-sm font-bold dark:text-white">
            {row.member.full_name}
          </span>
        </div>
        {meta && (
          <GeneralLabelAILN variant={meta.variant}>
            {meta.label}
          </GeneralLabelAILN>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold dark:text-white">{row.title}</h3>

      {/* Labels: kind, level, category */}
      <div className="flex flex-wrap items-center gap-1.5">
        <GeneralLabelAILN variant={kind.variant}>{kind.label}</GeneralLabelAILN>
        <GeneralLabelAILN variant="blue">
          Level {row.level_number}
        </GeneralLabelAILN>
        {row.category && (
          <GeneralLabelAILN variant="white">{row.category}</GeneralLabelAILN>
        )}
      </div>

      {/* Metadata: submitted + deadline */}
      <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
        {row.submitted_at && (
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            <span>Disubmit: {fmt(row.submitted_at)}</span>
          </div>
        )}
        {row.deadline && (
          <div className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5 shrink-0" />
            <span>Deadline: {fmt(row.deadline)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="rounded-md bg-card-2 p-3 text-xs text-gray-500 dark:text-gray-400">
        <p className="line-clamp-2">{row.body}</p>
      </div>

      {/* Outcome chips (use case only) */}
      {(row.hours_saved != null || row.ai_tool) && (
        <div className="flex flex-wrap gap-1.5">
          {row.hours_saved != null && (
            <GeneralLabelAILN variant="green">
              +{row.hours_saved.toLocaleString("id-ID")} jam dihemat
            </GeneralLabelAILN>
          )}
          {row.ai_tool && (
            <GeneralLabelAILN
              variant="white"
              icon={<Wrench className="size-3.5" />}
            >
              {row.ai_tool}
            </GeneralLabelAILN>
          )}
        </div>
      )}
    </Link>
  );
}
