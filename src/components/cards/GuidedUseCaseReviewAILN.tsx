"use client";

import type { GuidedSession, GuidedTestimonial } from "@/apis/use-cases";
import GuidedStepCardAILN from "@/components/cards/GuidedStepCardAILN";
import { GUIDED_FREQUENCIES, isGuidedProofLink } from "@/lib/guided-use-case";
import { ChevronDown } from "lucide-react";

export default function GuidedUseCaseReviewAILN({
  session,
  testimonial,
  helpfulness_rating,
  share_consent,
  preview = false,
}: {
  session: GuidedSession;
  preview?: boolean;
} & Partial<GuidedTestimonial>) {
  return (
    <details className="group min-w-0 rounded-lg border border-dashboard-border bg-card-1">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg p-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-claude">
        {preview
          ? "Pratinjau informasi untuk Champion"
          : "Perjalanan use case dengan panduan"}
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-5 border-t border-dashboard-border p-4 sm:p-5">
        {preview && (
          <p className="text-sm text-muted-foreground">
            Ini ringkasan isian lokalmu dengan contoh workflow. Belum dikirim ke
            Champion.
          </p>
        )}
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="mb-1 font-medium">Pekerjaan harian</dt>
            <dd className="whitespace-pre-wrap break-words text-muted-foreground">
              {session.daily_task || "—"}
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-medium">Frekuensi</dt>
            <dd className="text-muted-foreground">
              {GUIDED_FREQUENCIES.find(
                (item) => item.value === session.frequency,
              )?.label ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-medium">Waktu tanpa AI</dt>
            <dd className="text-muted-foreground">
              {session.minutes_without_ai ?? "—"} menit per pengerjaan
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="mb-1 font-medium">Contoh pekerjaan</dt>
            <dd className="whitespace-pre-wrap break-words text-muted-foreground">
              {session.example_text || "—"}
            </dd>
            {session.example_file_url &&
              isGuidedProofLink(session.example_file_url) && (
                <dd className="mt-2">
                  <a
                    href={session.example_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-claude underline dark:text-lime-bright"
                  >
                    Buka file contoh
                  </a>
                </dd>
              )}
          </div>
          <div>
            <dt className="mb-1 font-medium">Konfirmasi penyamaran data</dt>
            <dd className="text-muted-foreground">
              {session.sensitive_data_confirmed
                ? "Sudah dikonfirmasi student"
                : "Belum dikonfirmasi"}
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-medium">Tool saat ini</dt>
            <dd className="break-words text-muted-foreground">
              {session.current_tools.join(", ") || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="mb-1 font-medium">Proses saat ini</dt>
            <dd className="whitespace-pre-wrap break-words text-muted-foreground">
              {session.current_process || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="mb-1 font-medium">Bagian tersulit</dt>
            <dd className="whitespace-pre-wrap break-words text-muted-foreground">
              {session.pain_point || "—"}
            </dd>
          </div>
        </dl>
        {session.risks.length > 0 && (
          <div className="rounded-lg bg-card-2 p-4">
            <h3 className="mb-2 text-sm font-medium">
              Risiko & batasan workflow
            </h3>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {session.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium">
            {preview
              ? "Contoh langkah & checklist lokal"
              : "Langkah AI & checklist"}
          </h3>
          {session.steps.map((step) => (
            <div key={step.id} className="flex flex-col gap-2">
              <GuidedStepCardAILN step={step} />
              <div className="rounded-lg bg-card-2 p-3 text-sm">
                <p className="font-medium">
                  {step.is_done
                    ? "Selesai"
                    : step.skipped_reason?.trim()
                      ? "Dilewati"
                      : "Belum selesai"}
                </p>
                {!step.is_done && step.skipped_reason && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                    Alasan: {step.skipped_reason}
                  </p>
                )}
                {step.note && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                    Catatan: {step.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-dashboard-border bg-card-2 p-4">
          <h3 className="mb-2 text-sm font-medium">Testimoni student</h3>
          <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
            {testimonial || "Belum ada testimoni."}
          </p>
          <p className="mt-3 text-sm">
            Seberapa membantu: {helpfulness_rating ?? "—"}/5
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {share_consent
              ? "Mengizinkan testimoni ditampilkan ke rekan kerja di Use Case Library."
              : "Tidak memberikan izin publikasi testimoni."}
          </p>
        </div>
      </div>
    </details>
  );
}
