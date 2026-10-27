"use client";

import type { TodayFocus, TodayFocusKind } from "@/apis/student";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import { useProjectId } from "@/lib/use-project-id";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { ArrowRight, CheckCircle2, Clock, MapPin } from "lucide-react";
import Link from "next/link";

dayjs.locale("id");

const SURFACE =
  "rounded-lg border border-hijau-t bg-gradient-to-br from-hijau-t via-white to-hijau-t/60 p-5 dark:border-claude/25 dark:from-claude/10 dark:via-card-1 dark:to-claude/10";

function labelForKind(kind: TodayFocusKind) {
  if (kind === "pre_test") return "Pre-test";
  if (kind === "post_test") return "Post-test";
  return "Sesi chapter";
}

function descForFocus(focus: TodayFocus) {
  if (focus.kind === "pre_test") {
    return `Mulai Chapter ${focus.chapter_name} dengan mengerjakan pre-test ini.`;
  }
  if (focus.kind === "post_test") {
    return `Materi Chapter ${focus.chapter_name} sudah siap dievaluasi. Kerjakan post-test untuk menutup chapter ini.`;
  }
  return `Sesi Chapter ${focus.chapter_name} akan datang. Periksa jadwal dan lokasi sebelum sesi dimulai.`;
}

function formatSchedule(value: string) {
  return dayjs(value).format("ddd, D MMM YYYY · HH:mm");
}

function hrefForFocus(focus: TodayFocus, projectId: string) {
  if (focus.kind === "upcoming_session") {
    return `/${projectId}/student/learning-path/${focus.chapter_id}`;
  }
  return `/${projectId}/student/chapter-tests/${focus.task_id}`;
}

export default function TodayFocusCardAILN({
  focus,
}: {
  focus: TodayFocus | null;
}) {
  const projectId = useProjectId();

  if (!focus) {
    return (
      <div
        className={`${SURFACE} flex h-fit flex-col items-center gap-2 py-8 text-center`}
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-claude dark:text-lime-bright">
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
  const methodLabel = focus.method === "online" ? "Online" : "Offline";
  const statusLabel =
    focus.kind === "upcoming_session"
      ? focus.locked
        ? "Dikunci admin"
        : "Akan datang"
      : "Belum dikerjakan";

  return (
    <div className={`${SURFACE} flex h-fit flex-col`}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-claude dark:text-lime-bright">
            <span className="size-2 rounded-full bg-lime-bright dark:shadow-[0_0_8px_rgba(214,238,48,0.9)]" />
            Fokus Hari Ini
          </div>

          <h2 className="text-[30px] font-medium leading-tight text-gray-900 dark:text-white">
            {focus.task_title}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {descForFocus(focus)}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <GeneralLabelAILN
              variant="blue"
              icon={<Clock className="size-3.5" />}
            >
              {formatSchedule(focus.session_date)}
            </GeneralLabelAILN>
            <GeneralLabelAILN variant="red">
              {labelForKind(focus.kind)}
            </GeneralLabelAILN>
            <GeneralLabelAILN variant="white">
              L{focus.level_number}
            </GeneralLabelAILN>
            <GeneralLabelAILN
              variant="green"
              icon={<MapPin className="size-3.5" />}
            >
              {methodLabel}
            </GeneralLabelAILN>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ButtonAILN variant="dark" asChild>
              <Link href={focusHref}>
                {focus.kind === "upcoming_session"
                  ? "Lihat chapter"
                  : "Mulai sekarang"}
                <ArrowRight className="size-3.5" />
              </Link>
            </ButtonAILN>
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-hijau-t bg-white/70 p-4 dark:border-claude/20 dark:bg-card-1/60">
          <div className="tabular-nums text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Detail Tugas
          </div>
          <dl className="mt-3 flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Lokasi</dt>
              <dd className="text-right font-medium text-gray-900 dark:text-white">
                {focus.location_name}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Durasi</dt>
              <dd className="tabular-nums font-medium text-gray-900 dark:text-white">
                {focus.duration_minutes} menit
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="tabular-nums font-medium text-amber-600 dark:text-amber-400">
                {statusLabel}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
