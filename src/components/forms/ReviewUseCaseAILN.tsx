"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import AppPageState from "@/components/states/AppPageState";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

type Status =
  | "PENDING_SUBMIT"
  | "AWAITING_REVIEW"
  | "NEEDS_REVISION"
  | "ACCEPTED";

const STATUS_META: Record<
  Status,
  { label: string; variant: GeneralLabelVariantAILN }
> = {
  PENDING_SUBMIT: { label: "Belum dikerjakan", variant: "yellow" },
  AWAITING_REVIEW: { label: "Perlu review", variant: "blue" },
  NEEDS_REVISION: { label: "Menunggu revisi student", variant: "red" },
  ACCEPTED: { label: "Diterima", variant: "green" },
};

const FREQUENCY_LABEL: Record<string, string> = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  OCCASIONALLY: "Sesekali",
};

const fmt = (d: string) =>
  dayjs(d).locale("id").format("ddd, D MMM YYYY · HH:mm");

export default function ReviewUseCaseAILN({
  sessionToken,
  submissionId,
}: {
  sessionToken: string;
  submissionId: number;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();
  const detailQ = trpc.read.useCaseSubmissionDetail.useQuery({
    submission_id: submissionId,
  });
  const reviewM = trpc.update.reviewUseCaseSubmission.useMutation();

  const s = detailQ.data?.submission;

  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!s) return;
    queueMicrotask(() => {
      setComment(s.comment ?? "");
    });
  }, [s]);

  const status: Status = useMemo(() => {
    if (!s) return "PENDING_SUBMIT";
    if (s.is_accepted) return "ACCEPTED";
    if (!s.submitted_at) return "PENDING_SUBMIT";
    if (
      s.reviewed_at &&
      dayjs(s.reviewed_at as unknown as string).isAfter(
        dayjs(s.submitted_at as unknown as string)
      )
    )
      return "NEEDS_REVISION";
    return "AWAITING_REVIEW";
  }, [s]);

  if (detailQ.isLoading) {
    return (
      <PageContainerAILN>
        <div className="flex w-full items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </PageContainerAILN>
    );
  }
  if (detailQ.error) {
    if (detailQ.error.data?.code === "NOT_FOUND") {
      return (
        <PageContainerAILN>
          <AppPageState variant="NOT_FOUND" />
        </PageContainerAILN>
      );
    }
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }
  if (!s) {
    return (
      <PageContainerAILN>
        <AppPageState variant="NOT_FOUND" />
      </PageContainerAILN>
    );
  }

  const meta = STATUS_META[status];
  const canReview =
    status === "AWAITING_REVIEW" || status === "NEEDS_REVISION";
  const deadline = s.deadline as unknown as string | null;
  const submittedAt = s.submitted_at as unknown as string | null;

  const handleReview = (isAccepted: boolean) => {
    if (!isAccepted && !comment.trim()) {
      toast.error("Catatan wajib diisi kalau minta revisi.");
      return;
    }
    reviewM.mutate(
      {
        submission_id: submissionId,
        is_accepted: isAccepted,
        comment: comment.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(
            isAccepted ? "Submisi diterima." : "Revisi diminta ke student."
          );
          utils.read.useCaseSubmissionDetail.invalidate({
            submission_id: submissionId,
          });
          utils.list.useCaseSubmissions.invalidate();
        },
        onError: (err) => {
          toast.error("Gagal menyimpan review", { description: err.message });
        },
      }
    );
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title={s.use_case.name}
          desc={`Review submission dari ${s.member.full_name}`}
        >
          {canReview && (
            <>
              <ButtonAILN
                type="button"
                variant="destructive"
                disabled={reviewM.isPending}
                onClick={() => handleReview(false)}
              >
                <RotateCcw className="size-4" />
                Minta Revisi
              </ButtonAILN>
              <ButtonAILN
                type="button"
                variant="champion"
                disabled={reviewM.isPending}
                onClick={() => handleReview(true)}
              >
                {reviewM.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Terima Submission
              </ButtonAILN>
            </>
          )}
        </PageHeaderAILN>

        {/* Labels */}
        <div className="flex flex-wrap items-center gap-1.5">
          <GeneralLabelAILN variant="green">Use Case</GeneralLabelAILN>
          <GeneralLabelAILN variant="blue">
            Level {s.use_case.level.level_number}
          </GeneralLabelAILN>
          {s.use_case.categories.map((c) => (
            <GeneralLabelAILN key={c.id} variant="white">
              {c.name}
            </GeneralLabelAILN>
          ))}
          <GeneralLabelAILN variant={meta.variant}>
            {meta.label}
          </GeneralLabelAILN>
        </div>

        {/* Member + metadata */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-3">
            <Image
              src={s.member.avatar || DEFAULT_AVATAR}
              alt={s.member.full_name}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-semibold dark:text-white">
                {s.member.full_name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {s.member.email}
              </div>
            </div>
          </div>
          {submittedAt && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="size-3.5 shrink-0" />
              Disubmit: {fmt(submittedAt)}
            </div>
          )}
          {deadline && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <CalendarClock className="size-3.5 shrink-0" />
              Deadline: {fmt(deadline)}
            </div>
          )}
        </div>

        {/* Two panels */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Left: student answer */}
          <div className="flex flex-col gap-6">
            <SectionContainerAILN title="Deskripsi Use Case">
              <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                {s.use_case.description}
              </p>
            </SectionContainerAILN>

            <SectionContainerAILN
              title="Jawaban Student"
              contentClassName="flex flex-col gap-4"
            >
              {submittedAt ? (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Metric
                      label="Hours saved"
                      value={
                        s.hours_saved !== null && s.hours_saved !== undefined
                          ? `${s.hours_saved} jam`
                          : "—"
                      }
                    />
                    <Metric label="AI tool" value={s.ai_tool ?? "—"} />
                    <Metric
                      label="Frekuensi"
                      value={s.frequency ? FREQUENCY_LABEL[s.frequency] : "—"}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Outcome / bukti
                    </div>
                    <OutcomeProof value={s.outcome_proof} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Deskripsi penerapan
                    </div>
                    <p className="whitespace-pre-wrap rounded-md border border-dashboard-border bg-card-2 p-3 text-sm text-gray-700 dark:text-gray-200">
                      {s.description ?? "—"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Student belum submit.
                </p>
              )}
            </SectionContainerAILN>
          </div>

          {/* Right: assessment */}
          <SectionContainerAILN
            title="Penilaian"
            desc="Catatan review untuk student."
            className="self-start xl:sticky xl:top-6"
            contentClassName="flex flex-col gap-5"
          >
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Catatan Submission
              </div>
              <TextAreaAILN
                textAreaId="review-comment"
                textAreaPlaceholder="Tulis feedback (wajib kalau minta revisi, opsional kalau accept)"
                textAreaHeight="h-28"
                characterLength={2000}
                variant="CHAMPION"
                value={comment}
                onTextAreaChange={setComment}
                disabled={!canReview}
              />
              <div className="mt-1 text-right text-xs text-gray-400">
                {comment.length}/2000
              </div>
            </div>

            {!canReview && s.comment && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-gray-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-gray-200">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Catatan terakhir
                  {s.reviewed_at &&
                    ` · ${dayjs(s.reviewed_at as unknown as string)
                      .locale("id")
                      .format("D MMM · HH:mm")}`}
                </div>
                {s.comment}
              </div>
            )}
          </SectionContainerAILN>
        </div>
      </div>
    </PageContainerAILN>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-dashboard-border bg-card-2 p-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="text-sm font-medium dark:text-gray-200">{value}</div>
    </div>
  );
}

function OutcomeProof({ value }: { value: string | null | undefined }) {
  const proof = value?.trim();

  if (!proof) {
    return (
      <p className="rounded-md border border-dashboard-border bg-card-2 p-3 text-sm text-gray-700 dark:text-gray-200">
        —
      </p>
    );
  }

  const isUrl = /^https?:\/\//i.test(proof);
  const cleanUrl = proof.split(/[?#]/)[0].toLowerCase();
  const isImage = isUrl && /\.(png|jpe?g|gif|webp|avif|svg)$/.test(cleanUrl);
  const isVideo = isUrl && /\.(mp4|webm|mov)$/.test(cleanUrl);

  if (isImage) {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={proof}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-md border border-dashboard-border bg-card-2"
        >
          <Image
            src={proof}
            alt="Bukti outcome"
            width={1200}
            height={800}
            unoptimized
            className="h-auto max-h-[480px] w-full object-contain"
          />
        </a>
        <a
          href={proof}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
        >
          <ExternalLink className="size-3.5" />
          Buka gambar di tab baru
        </a>
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={proof}
        controls
        className="max-h-[480px] w-full rounded-md border border-dashboard-border bg-black"
      />
    );
  }

  if (isUrl) {
    return (
      <a
        href={proof}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 break-all rounded-md border border-dashboard-border bg-card-2 px-3 py-2 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
      >
        <FileText className="size-4 shrink-0" />
        {proof}
      </a>
    );
  }

  return (
    <p className="break-words rounded-md border border-dashboard-border bg-card-2 p-3 text-sm text-gray-700 dark:text-gray-200">
      {proof}
    </p>
  );
}
