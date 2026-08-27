"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import type { TodayFocus, TodayFocusKind } from "@/apis/learnings";
import { useProjectId } from "@/lib/use-project-id";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { ArrowRight, CheckCircle2, Clock, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

dayjs.locale("id");

// Soft green gradient surface — khas Today's Focus (beda dari card lain yang #FCFCFD).
const SURFACE =
  "rounded-lg border border-hijau-t bg-gradient-to-br from-hijau-t via-white to-hijau-t/60 p-5 dark:border-claude/25 dark:from-claude/10 dark:via-card-1 dark:to-claude/10";

function labelForKind(kind: TodayFocusKind) {
  if (kind === "quiz") return "Quiz";
  if (kind === "video") return "Video";
  if (kind === "prompt_practice") return "Prompt";
  if (kind === "use_case_practice") return "Use Case";
  return "Materi";
}

// Kalimat ajakan — sebelumnya jadi judul, sekarang turun ke deskripsi.
function descForFocus(focus: Pick<TodayFocus, "kind" | "chapter_name">) {
  const label = labelForKind(focus.kind).toLowerCase();
  if (focus.kind === "prompt_practice" || focus.kind === "use_case_practice") {
    return `Kerjakan ${label} ini sebelum tenggat yang diberikan Champion kamu.`;
  }
  return `Selesaikan ${label} ini${
    focus.chapter_name ? ` di Chapter ${focus.chapter_name}` : ""
  } supaya progres kamu terus maju.`;
}

function formatDeadline(d: string) {
  return dayjs(d).format("ddd, D MMM YYYY · HH:mm");
}

function hrefForFocus(focus: TodayFocus, projectId: string) {
  switch (focus.kind) {
    case "material":
      return `/${projectId}/student/materials/${focus.task_id}`;
    case "video":
      return `/${projectId}/student/videos/${focus.task_id}`;
    case "quiz":
      return `/${projectId}/student/quizzes/${focus.task_id}`;
    case "prompt_practice":
      return `/${projectId}/student/skill-practice/prompts/${focus.task_id}`;
    case "use_case_practice":
      return `/${projectId}/student/skill-practice/use-cases/${focus.task_id}`;
  }
}

function detailHrefForFocus(focus: TodayFocus, projectId: string) {
  if (focus.kind === "prompt_practice" || focus.kind === "use_case_practice") {
    return focus.level_id != null
      ? `/${projectId}/student/learning-path?practice=${focus.level_id}`
      : `/${projectId}/student/learning-path`;
  }
  return focus.chapter_id != null
    ? `/${projectId}/student/learning-path?chapter=${focus.chapter_id}`
    : `/${projectId}/student/learning-path`;
}

export default function TodayFocusCardAILN({
  focus,
}: {
  focus: TodayFocus | null;
}) {
  const router = useRouter();
  const projectId = useProjectId();
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);

  if (!focus) {
    return (
      <div
        className={`${SURFACE} flex h-fit flex-col items-center gap-2 py-8 text-center`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-claude dark:text-lime-bright">
          <span className="size-2 rounded-full bg-lime-bright dark:shadow-[0_0_8px_rgba(214,238,48,0.9)]" />
          Fokus Hari Ini
        </div>
        <CheckCircle2 className="size-8 text-claude dark:text-lime-bright" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Semua tugas kamu sudah selesai. Cek lagi nanti untuk tugas baru.
        </p>
      </div>
    );
  }

  const focusHref = hrefForFocus(focus, projectId);
  const detailHref = detailHrefForFocus(focus, projectId);

  const jenisLabel =
    labelForKind(focus.kind) +
    (focus.level_number != null ? ` L${focus.level_number}` : "");

  return (
    <div className={`${SURFACE} flex h-fit flex-col`}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Kiri — fokus utama */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-claude dark:text-lime-bright">
            <span className="size-2 rounded-full bg-lime-bright dark:shadow-[0_0_8px_rgba(214,238,48,0.9)]" />
            Fokus Hari Ini
          </div>

          <h2 className="text-[30px] font-bold leading-tight text-gray-900 dark:text-white">
            {focus.task_title}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {descForFocus(focus)}
          </p>

          {/* Label-label */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {focus.deadline && (
              <GeneralLabelAILN
                variant="blue"
                icon={<Clock className="size-3.5" />}
              >
                Deadline {formatDeadline(focus.deadline)}
              </GeneralLabelAILN>
            )}
            <GeneralLabelAILN variant="red">
              {labelForKind(focus.kind)}
            </GeneralLabelAILN>
            {focus.level_number != null && (
              <GeneralLabelAILN variant="white">
                L{focus.level_number}
              </GeneralLabelAILN>
            )}
            {focus.assigned_by && (
              <GeneralLabelAILN
                variant="green"
                icon={<Lightbulb className="size-3.5" />}
              >
                Dari {focus.assigned_by.name} (Champion)
              </GeneralLabelAILN>
            )}
          </div>

          {/* Aksi */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {focus.kind === "quiz" ? (
              <ButtonAILN onClick={() => setIsQuizDialogOpen(true)}>
                Mulai sekarang
                <ArrowRight className="size-3.5" />
              </ButtonAILN>
            ) : (
              <Link href={focusHref}>
                <ButtonAILN>
                  Mulai sekarang
                  <ArrowRight className="size-3.5" />
                </ButtonAILN>
              </Link>
            )}
            <Link href={detailHref}>
              <ButtonAILN variant="neutral">Lihat detail</ButtonAILN>
            </Link>
          </div>
        </div>

        {/* Kanan — detail tugas */}
        <aside className="h-fit rounded-xl border border-hijau-t bg-white/70 p-4 dark:border-claude/20 dark:bg-card-1/60">
          <div className="mono text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Detail Tugas
          </div>
          <dl className="mt-3 flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Jenis</dt>
              <dd className="mono font-semibold text-claude dark:text-lime-bright">
                {jenisLabel}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Kategori</dt>
              <dd className="mono font-semibold text-gray-900 dark:text-white">
                {focus.category ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mono font-semibold text-amber-600 dark:text-amber-400">
                Belum dikerjakan
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {focus.kind === "quiz" && (
        <AlertConfirmDialogAILN
          isOpen={isQuizDialogOpen}
          alertDialogHeader="Mulai Quiz Sekarang?"
          alertDialogMessage="Waktu akan terus berjalan setelah quiz dimulai dan tidak bisa di-pause walaupun kamu keluar halaman."
          alertCancelLabel="Batal"
          alertConfirmLabel="Mulai sekarang"
          onClose={() => setIsQuizDialogOpen(false)}
          onConfirm={() => {
            setIsQuizDialogOpen(false);
            router.push(focusHref);
          }}
        />
      )}
    </div>
  );
}
