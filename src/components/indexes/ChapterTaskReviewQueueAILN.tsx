"use client";

import type {
  ChapterTaskQueue,
  ChapterTaskQueueItem,
  ChapterTaskReviewDecision,
  ChapterTaskSubmissionStatus,
} from "@/apis/chapter-tasks";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SelectAILN from "@/components/fields/SelectAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import ChapterTaskStatusBadgeAILN from "@/components/labels/ChapterTaskStatusBadgeAILN";
import ImageLightboxAILN from "@/components/modals/ImageLightboxAILN";
import Tabs from "@/components/navigations/Tabs";
import { CHAPTER_TASK_COMMENT_MAX, isImageUrl } from "@/lib/chapter-task";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export type ChapterTaskQueueSearch = {
  status: ChapterTaskSubmissionStatus;
  chapterId: number | null;
  page: number;
};

const STATUS_TABS: { value: ChapterTaskSubmissionStatus; label: string }[] = [
  { value: "on_review", label: "Belum direview" },
  { value: "rejected", label: "Ditolak" },
  { value: "approved", label: "Disetujui" },
];

function formatDate(value: string) {
  return dayjs(value).locale("id").format("D MMM YYYY, HH:mm");
}

function QueueCard({
  item,
  onPreview,
}: {
  item: ChapterTaskQueueItem;
  onPreview: (src: string) => void;
}) {
  const router = useRouter();
  const [isRejecting, setIsRejecting] = useState(false);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState<ChapterTaskReviewDecision | null>(null);
  const image = isImageUrl(item.proof_url);

  const review = async (decision: ChapterTaskReviewDecision) => {
    if (saving) return;
    if (decision === "reject" && !comment.trim()) {
      toast.error(
        "Tulis komentar supaya peserta tahu apa yang perlu diperbaiki.",
      );
      return;
    }
    setSaving(decision);
    try {
      const response = await fetch("/api/champion/chapter-tasks/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: item.id,
          decision,
          comment: comment.trim() || null,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(
          response.status === 409
            ? "Submission ini sudah direview."
            : (body?.message ?? "Gagal menyimpan review. Coba lagi."),
        );
        if (response.status === 409) router.refresh();
        return;
      }
      toast.success(
        decision === "approve"
          ? "Tugas disetujui"
          : "Tugas dikembalikan ke peserta",
      );
      router.refresh();
    } finally {
      setSaving(null);
    }
  };

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {item.student.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.student.avatar}
              alt=""
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.student.full_name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-950 dark:text-white">
              {item.student.full_name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {item.student.group.name} · {formatDate(item.submitted_at)}
            </p>
          </div>
          <ChapterTaskStatusBadgeAILN status={item.status} />
        </div>

        <div className="flex items-center gap-2.5 rounded-lg bg-card-2 px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.tool.image_url}
            alt=""
            className="size-7 shrink-0 rounded-md bg-white object-contain p-0.5"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-950 dark:text-white">
              {item.task.name}
            </p>
            <p className="truncate text-xs text-gray-600 dark:text-gray-400">
              {item.task.chapter.name} · {item.tool.name}
            </p>
          </div>
        </div>

        {image ? (
          <button
            type="button"
            onClick={() => onPreview(item.proof_url)}
            className="block overflow-hidden rounded-lg border border-dashboard-border bg-card-2 focus-visible:outline-2 focus-visible:outline-claude"
            aria-label={`Perbesar bukti ${item.student.full_name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.proof_url}
              alt={`Bukti ${item.student.full_name}`}
              loading="lazy"
              className="max-h-64 w-full object-contain"
            />
          </button>
        ) : (
          <ButtonAILN asChild variant="outline" size="small">
            <a href={item.proof_url} target="_blank" rel="noopener noreferrer">
              Buka file bukti
              <ExternalLink className="size-3.5" />
            </a>
          </ButtonAILN>
        )}

        {item.note && (
          <p className="whitespace-pre-line text-xs leading-5 text-gray-700 dark:text-gray-300">
            <span className="font-medium">Catatan peserta: </span>
            {item.note}
          </p>
        )}

        {item.status !== "on_review" && (
          <div className="space-y-1 border-t border-dashboard-border pt-3 text-xs leading-5 text-gray-600 dark:text-gray-400">
            <p>
              Direview{" "}
              {item.reviewer?.role === "administrator"
                ? "oleh admin"
                : item.reviewer?.full_name
                  ? `oleh ${item.reviewer.full_name}`
                  : ""}
              {item.reviewed_at ? ` · ${formatDate(item.reviewed_at)}` : ""}
            </p>
            {item.review_comment && (
              <p className="whitespace-pre-line text-gray-800 dark:text-gray-200">
                {item.review_comment}
              </p>
            )}
          </div>
        )}
      </div>

      {item.status === "on_review" && (
        <div className="mt-auto space-y-3 border-t border-dashboard-border bg-card-2 px-4 py-3">
          {isRejecting && (
            <TextAreaAILN
              textAreaId={`chapter-task-review-${item.id}`}
              textAreaName="Komentar untuk peserta"
              textAreaPlaceholder="Jelaskan apa yang perlu diperbaiki."
              characterLength={CHAPTER_TASK_COMMENT_MAX}
              value={comment}
              disabled={saving !== null}
              onTextAreaChange={setComment}
              rows={3}
              required
            />
          )}
          <div className="flex flex-wrap gap-2">
            {isRejecting ? (
              <>
                <ButtonAILN
                  variant="destructive"
                  size="small"
                  disabled={saving !== null || !comment.trim()}
                  onClick={() => void review("reject")}
                >
                  {saving === "reject" && (
                    <Loader2 className="size-3.5 animate-spin" />
                  )}
                  Kirim penolakan
                </ButtonAILN>
                <ButtonAILN
                  variant="ghost"
                  size="small"
                  disabled={saving !== null}
                  onClick={() => setIsRejecting(false)}
                >
                  Batal
                </ButtonAILN>
              </>
            ) : (
              <>
                <ButtonAILN
                  variant="dark"
                  size="small"
                  disabled={saving !== null}
                  onClick={() => void review("approve")}
                >
                  {saving === "approve" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  Approve
                </ButtonAILN>
                <ButtonAILN
                  variant="outline"
                  size="small"
                  disabled={saving !== null}
                  onClick={() => setIsRejecting(true)}
                >
                  <X className="size-3.5" />
                  Reject
                </ButtonAILN>
              </>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export default function ChapterTaskReviewQueueAILN({
  queue,
  failed,
  chapters,
  search,
}: {
  queue: ChapterTaskQueue | null;
  failed: boolean;
  chapters: { id: number; name: string }[];
  search: ChapterTaskQueueSearch;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [preview, setPreview] = useState<string | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);

  const navigate = (next: Partial<ChapterTaskQueueSearch>) => {
    const merged = { ...search, page: 1, ...next };
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "tasks");
    params.set("task_status", merged.status);
    if (merged.chapterId) params.set("task_chapter", String(merged.chapterId));
    else params.delete("task_chapter");
    if (merged.page > 1) params.set("task_page", String(merged.page));
    else params.delete("task_page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const items = queue?.list ?? [];
  const meta = queue?.metapaging;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Tabs<ChapterTaskSubmissionStatus>
          ariaLabel="Status review tugas praktik"
          value={search.status}
          onValueChange={(status) => navigate({ status })}
          items={STATUS_TABS}
        />
        <div className="w-full sm:w-64">
          <SelectAILN
            selectId="chapter-task-chapter"
            selectPlaceholder="Semua chapter"
            aria-label="Filter chapter"
            value={search.chapterId ?? 0}
            onChange={(value) => navigate({ chapterId: Number(value) || null })}
            options={[
              { value: 0, label: "Semua chapter" },
              ...chapters.map((chapter) => ({
                value: chapter.id,
                label: chapter.name,
              })),
            ]}
          />
        </div>
      </div>

      {failed ? (
        <p className="rounded-lg border border-dashboard-border bg-card-1 p-6 text-sm text-gray-600 dark:text-gray-400">
          Antrean tugas praktik belum dapat dimuat. Coba muat ulang halaman.
        </p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border py-12 text-center text-gray-500 dark:text-gray-400">
          <ClipboardList className="size-6" />
          <div className="text-sm">
            Tidak ada tugas praktik dengan status &quot;
            {STATUS_TABS.find((tab) => tab.value === search.status)?.label}
            &quot;.
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <QueueCard key={item.id} item={item} onPreview={setPreview} />
          ))}
        </ul>
      )}

      {meta && meta.total_page > 1 && (
        <nav
          aria-label="Halaman antrean tugas praktik"
          className="flex items-center justify-between gap-3"
        >
          <ButtonAILN
            variant="outline"
            size="small"
            disabled={meta.current_page <= 1}
            onClick={() => navigate({ page: meta.current_page - 1 })}
          >
            <ChevronLeft className="size-3.5" />
            Sebelumnya
          </ButtonAILN>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Halaman {meta.current_page} dari {meta.total_page}
          </span>
          <ButtonAILN
            variant="outline"
            size="small"
            disabled={meta.current_page >= meta.total_page}
            onClick={() => navigate({ page: meta.current_page + 1 })}
          >
            Berikutnya
            <ChevronRight className="size-3.5" />
          </ButtonAILN>
        </nav>
      )}

      <ImageLightboxAILN
        src={preview}
        alt="Bukti pengerjaan"
        onClose={closePreview}
      />
    </div>
  );
}
