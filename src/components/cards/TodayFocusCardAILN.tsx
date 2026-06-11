"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import { trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { ArrowRight, Clock, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

dayjs.locale("id");

// Soft red gradient surface — khas Today's Focus (beda dari card lain yang #FCFCFD).
const SURFACE =
  "rounded-lg border border-red-100 bg-gradient-to-br from-red-50 via-white to-rose-50/60 p-5 dark:border-red-500/25 dark:from-red-500/10 dark:via-card-1 dark:to-rose-500/10";

type FocusKind =
  | "Quiz"
  | "Video"
  | "Material"
  | "PromptPractice"
  | "UseCasePractice";

function labelForKind(kind: FocusKind) {
  if (kind === "Quiz") return "Quiz";
  if (kind === "Video") return "Video";
  if (kind === "PromptPractice") return "Prompt";
  if (kind === "UseCasePractice") return "Use Case";
  return "Materi";
}

// Kalimat ajakan — sebelumnya jadi judul, sekarang turun ke deskripsi.
function descForFocus(focus: {
  kind: FocusKind;
  chapter_name: string | null;
}) {
  const label = labelForKind(focus.kind).toLowerCase();
  if (focus.kind === "PromptPractice" || focus.kind === "UseCasePractice") {
    return `Kerjakan ${label} ini sebelum tenggat yang diberikan Champion kamu.`;
  }
  return `Selesaikan ${label} ini${
    focus.chapter_name ? ` di Chapter ${focus.chapter_name}` : ""
  } supaya progres kamu terus maju.`;
}

function formatDeadline(d: Date | string) {
  return dayjs(d).format("ddd, D MMM YYYY · HH:mm");
}

export default function TodayFocusCardAILN() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const q = trpc.read.todayFocus.useQuery();

  const completeVideo = trpc.create.completeVideo.useMutation({
    onSuccess: () => {
      utils.read.todayFocus.invalidate();
      utils.list.tasks.invalidate();
      utils.auth.checkAilMember.invalidate();
    },
  });

  if (q.isLoading) {
    return (
      <CardShell>
        <CardLoading />
      </CardShell>
    );
  }
  if (q.error || !q.data) {
    return (
      <CardShell>
        <CardError />
      </CardShell>
    );
  }

  const focus = q.data.focus;

  if (!focus) {
    return (
      <CardShell>
        <h2 className="text-xl font-bold leading-snug text-gray-900 dark:text-white">
          Semua task terbaru sudah kamu selesaikan 🎉
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tunggu chapter berikutnya terbuka, atau lihat ulang materi yang sudah
          dikerjakan.
        </p>
        <div className="mt-3">
          <Link href="/student/modules">
            <ButtonAILN>Lihat modul belajar</ButtonAILN>
          </Link>
        </div>
      </CardShell>
    );
  }

  const detailHref =
    focus.kind === "PromptPractice" || focus.kind === "UseCasePractice"
      ? focus.level_id != null
        ? `/student/modules?practice=${focus.level_id}`
        : "/student/modules"
      : focus.chapter_id != null
        ? `/student/modules?chapter=${focus.chapter_id}`
        : "/student/modules";

  const jenisLabel =
    labelForKind(focus.kind) +
    (focus.level_number != null ? ` L${focus.level_number}` : "");

  return (
    <div className={`${SURFACE} flex h-fit flex-col`}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Kiri — fokus utama */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
            <span className="size-2 rounded-full bg-red-500 dark:shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
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
            {focus.assigned_by_name && (
              <GeneralLabelAILN
                variant="green"
                icon={<Lightbulb className="size-3.5" />}
              >
                Dari {focus.assigned_by_name} (Champion)
              </GeneralLabelAILN>
            )}
          </div>

          {/* Aksi */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {focus.kind === "Video" && (
              <a
                href={focus.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
                onClick={() =>
                  completeVideo.mutate({ video_id: Number(focus.task_id) })
                }
              >
                <ButtonAILN>
                  Mulai sekarang
                  <ArrowRight className="size-3.5" />
                </ButtonAILN>
              </a>
            )}
            {focus.kind === "Material" && (
              <Link href={focus.href}>
                <ButtonAILN>
                  Mulai sekarang
                  <ArrowRight className="size-3.5" />
                </ButtonAILN>
              </Link>
            )}
            {(focus.kind === "PromptPractice" ||
              focus.kind === "UseCasePractice") && (
              <Link href={focus.href}>
                <ButtonAILN>
                  Mulai sekarang
                  <ArrowRight className="size-3.5" />
                </ButtonAILN>
              </Link>
            )}
            {focus.kind === "Quiz" && (
              <ButtonAILN onClick={() => setIsQuizDialogOpen(true)}>
                Mulai sekarang
                <ArrowRight className="size-3.5" />
              </ButtonAILN>
            )}
            <Link href={detailHref}>
              <ButtonAILN variant="outline">Lihat detail</ButtonAILN>
            </Link>
          </div>
        </div>

        {/* Kanan — detail tugas */}
        <aside className="h-fit rounded-xl border border-red-100 bg-white/70 p-4 dark:border-red-500/20 dark:bg-card-1/60">
          <div className="mono text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Detail Tugas
          </div>
          <dl className="mt-3 flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Jenis</dt>
              <dd className="mono font-semibold text-red-600 dark:text-red-400">
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

      {focus.kind === "Quiz" && (
        <AlertConfirmDialogAILN
          isOpen={isQuizDialogOpen}
          alertDialogHeader="Mulai Quiz Sekarang?"
          alertDialogMessage="Waktu akan terus berjalan setelah quiz dimulai dan tidak bisa di-pause walaupun kamu keluar halaman."
          alertCancelLabel="Batal"
          alertConfirmLabel="Mulai sekarang"
          onClose={() => setIsQuizDialogOpen(false)}
          onConfirm={() => {
            setIsQuizDialogOpen(false);
            router.push(focus.href);
          }}
        />
      )}
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${SURFACE} flex h-fit flex-col gap-3`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
        <span className="size-2 rounded-full bg-red-500" />
        Fokus Hari Ini
      </div>
      {children}
    </div>
  );
}

function CardLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-dashboard-border" />
      <div className="h-4 w-full rounded bg-gray-200 dark:bg-dashboard-border" />
      <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-dashboard-border" />
      <div className="mt-2 flex items-center gap-2">
        <div className="h-9 w-32 rounded-md bg-gray-200 dark:bg-dashboard-border" />
        <div className="h-9 w-24 rounded-md bg-gray-200 dark:bg-dashboard-border" />
      </div>
    </div>
  );
}

function CardError() {
  return (
    <div className="flex h-20 items-center justify-center">
      <span className="text-xs text-red-500 dark:text-red-400">
        Gagal memuat data.
      </span>
    </div>
  );
}
