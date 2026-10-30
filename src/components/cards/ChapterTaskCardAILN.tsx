"use client";

import type {
  ChapterTask,
  ChapterTaskDetail,
  ChapterTaskStatus,
} from "@/apis/chapter-tasks";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import ChapterTaskSubmissionModalAILN from "@/components/modals/ChapterTaskSubmissionModalAILN";
import ImageLightboxAILN from "@/components/modals/ImageLightboxAILN";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  MessageSquareWarning,
  RotateCcw,
} from "lucide-react";
import { Accordion } from "radix-ui";
import { useCallback, useRef, useState } from "react";

function TaskState({ status }: { status: ChapterTaskStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-hijau-t px-3 text-[13px] font-medium text-claude dark:bg-claude/15 dark:text-lime-bright">
        <CheckCircle2 className="size-4" />
        Selesai
      </span>
    );
  }

  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-amber-50 px-3 text-[13px] font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
      <Clock3 className="size-4" />
      On review
    </span>
  );
}

function TaskSteps({ task }: { task: ChapterTaskDetail }) {
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(
    null,
  );
  const closePreview = useCallback(() => setPreview(null), []);

  return (
    <div className="p-5 sm:p-6">
      {task.my_status === "rejected" && task.my_submission?.review_comment && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-400/20 dark:bg-red-400/10">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
            <MessageSquareWarning className="size-4" />
            Catatan perbaikan
          </p>
          <p className="mt-1 whitespace-pre-line text-[13px] leading-6 text-red-800 dark:text-red-200">
            {task.my_submission.review_comment}
          </p>
        </div>
      )}

      {task.description && (
        <p className="mb-6 text-base leading-7 text-gray-600 dark:text-gray-300">
          {task.description}
        </p>
      )}

      <ol>
        {task.steps.map((step, index) => (
          <li
            key={step.step_number}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {index < task.steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[15px] top-8 border-l border-dashed border-gray-300 dark:border-white/20"
              />
            )}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-dashboard-border bg-card-2 text-sm font-medium text-gray-700 dark:bg-white/10 dark:text-white">
              {step.step_number}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="whitespace-pre-line text-base leading-7 text-gray-800 dark:text-gray-200">
                {step.instruction}
              </p>
              {step.image_url && (
                <button
                  type="button"
                  onClick={() =>
                    setPreview({
                      src: step.image_url!,
                      alt: `Contoh langkah ${step.step_number}`,
                    })
                  }
                  className="mt-3 block max-w-full cursor-zoom-in overflow-hidden rounded-lg border border-dashboard-border bg-card-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-claude"
                  aria-label={`Perbesar contoh langkah ${step.step_number}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.image_url}
                    alt={`Contoh langkah ${step.step_number}`}
                    loading="lazy"
                    className="block h-auto max-h-72 w-auto max-w-full object-contain"
                  />
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>

      <ImageLightboxAILN
        src={preview?.src ?? null}
        alt={preview?.alt ?? ""}
        onClose={closePreview}
      />
    </div>
  );
}

export default function ChapterTaskCardAILN({
  task,
  chapterNumber,
  expanded,
  onSubmitted,
}: {
  task: ChapterTask;
  chapterNumber: number;
  expanded: boolean;
  onSubmitted: () => void;
}) {
  const actionRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState(task.my_status);
  const [detail, setDetail] = useState<ChapterTaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const canWork = status === "not_started" || status === "rejected";

  const loadDetails = async () => {
    if (detail || loading) return;
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch("/api/chapter-tasks/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task.id }),
      });
      if (!response.ok) throw new Error("detail request failed");
      setDetail((await response.json()) as ChapterTaskDetail);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Accordion.Item
        id={`chapter-task-${task.id}`}
        value={String(task.id)}
        className="scroll-mt-6 overflow-hidden rounded-lg border border-dashboard-border bg-gray-50 dark:bg-card-1"
      >
        <Accordion.Header asChild>
          <div className="relative">
            <Accordion.Trigger
              className="absolute inset-0 z-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-claude"
              onClick={() => void loadDetails()}
              aria-label={`${expanded ? "Tutup" : "Buka"} langkah tugas ${task.name}`}
            />

            <div className="pointer-events-none relative z-10 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={task.tool.image_url}
                alt={`Logo ${task.tool.name}`}
                className="size-14 shrink-0 rounded-lg border border-dashboard-border bg-white object-contain"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-headline text-lg font-medium leading-snug text-gray-950 dark:text-white">
                    {task.name}
                  </h3>
                  <GeneralLabelAILN variant="white" className="text-[13px]">
                    {task.tool.name}
                  </GeneralLabelAILN>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Chapter {chapterNumber} · {task.chapter.name}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
                {canWork ? (
                  <span className="pointer-events-auto">
                    <ButtonAILN
                      ref={actionRef}
                      variant="dark"
                      size="medium"
                      onClick={() => setSubmissionOpen(true)}
                    >
                      {status === "rejected" && (
                        <RotateCcw className="size-4" />
                      )}
                      {status === "rejected" ? "Kerjakan ulang" : "Selesaikan"}
                    </ButtonAILN>
                  </span>
                ) : (
                  <TaskState status={status} />
                )}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-5 text-gray-500 transition-transform dark:text-gray-400 ${expanded ? "rotate-180" : ""}`}
                />
              </div>
            </div>
          </div>
        </Accordion.Header>

        <Accordion.Content
          id={`chapter-task-content-${task.id}`}
          className="border-t border-dashboard-border"
        >
          {loading ? (
            <div className="flex items-center gap-2 p-5 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="size-4 animate-spin" />
              Memuat detail tugas...
            </div>
          ) : failed ? (
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <p className="text-sm text-red-700 dark:text-red-300">
                Detail tugas belum dapat dimuat.
              </p>
              <ButtonAILN
                variant="outline"
                size="small"
                onClick={() => void loadDetails()}
              >
                Coba lagi
              </ButtonAILN>
            </div>
          ) : detail ? (
            <TaskSteps task={detail} />
          ) : null}
        </Accordion.Content>
      </Accordion.Item>

      {submissionOpen && (
        <ChapterTaskSubmissionModalAILN
          task={task}
          triggerRef={actionRef}
          onClose={() => setSubmissionOpen(false)}
          onSubmitted={() => {
            setStatus("on_review");
            setSubmissionOpen(false);
            onSubmitted();
          }}
        />
      )}
    </>
  );
}
