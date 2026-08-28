"use client";
import DisabledActionButtonAILN from "@/components/buttons/DisabledActionButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { PromptDetail } from "@/apis/prompts";
import dayjs from "dayjs";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock,
  FileText,
  Layers,
  Send,
  Sparkles,
  SquarePen,
  Tag,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

type Status =
  | "PENDING_SUBMIT"
  | "AWAITING_REVIEW"
  | "NEEDS_REVISION"
  | "ACCEPTED";

const statusMeta: Record<
  Status,
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

function FieldRow({
  icon,
  label,
  helper,
  required,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="size-9 shrink-0 rounded-md border border-dashboard-border bg-card-2 flex items-center justify-center text-foreground dark:text-gray-300">
        {icon}
      </div>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <label className="flex items-center gap-0.5 text-sm font-semibold  text-foreground dark:text-white">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
        {children}
        {helper && (
          <p className="text-xs  text-gray-500 dark:text-gray-400">{helper}</p>
        )}
      </div>
    </div>
  );
}

export default function SubmitPromptAILN({
  prompt,
}: {
  prompt: PromptDetail;
}) {
  const projectId = useProjectId();

  const [formData, setFormData] = useState<{
    input: string;
    output: string;
  }>({
    input: "",
    output: "",
  });

  const status: Status = useMemo(() => {
    if (prompt.is_accepted) return "ACCEPTED";
    if (!prompt.submitted_at) return "PENDING_SUBMIT";
    if (
      prompt.reviewed_at &&
      dayjs(prompt.reviewed_at).isAfter(dayjs(prompt.submitted_at))
    )
      return "NEEDS_REVISION";
    return "AWAITING_REVIEW";
  }, [prompt]);

  const meta = statusMeta[status];
  const StatusIcon = meta.icon;
  const isLocked = status === "ACCEPTED";
  const deadline = prompt.deadline_at;
  const deadlineDate = deadline ? dayjs(deadline) : null;
  const deadlineOverdue =
    deadlineDate !== null && !prompt.is_accepted && deadlineDate.isBefore(dayjs());

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <PageHeaderAILN title={prompt.name} />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <GeneralLabelAILN
              variant="red"
              icon={<Layers className="h-3 w-3" />}
            >
              Level {prompt.level_number}
            </GeneralLabelAILN>

            {prompt.categories.map((c) => (
              <GeneralLabelAILN
                key={c.id}
                variant="white"
                icon={<Tag className="h-3 w-3" />}
              >
                {c.name}
              </GeneralLabelAILN>
            ))}

            <GeneralLabelAILN
              variant={meta.variant}
              icon={<StatusIcon className="h-3 w-3" />}
            >
              {meta.label}
            </GeneralLabelAILN>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.8fr] lg:items-start">
          {/* LEFT: Detail prompt */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <div className="ailn-card flex flex-col gap-4 bg-card-1 p-5 border">
              <div className="size-10 rounded-full bg-black flex items-center justify-center text-white dark:bg-white dark:text-black">
                <FileText className="size-5" />
              </div>
              <h2 className="text-lg font-bold  text-foreground dark:text-white">
                Deskripsi Prompt
              </h2>

              <div className="flex flex-col gap-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide  text-gray-500 dark:text-gray-400">
                  Skenario
                </div>
                <p className="text-sm whitespace-pre-wrap  text-gray-700 dark:text-gray-200">
                  {prompt.scenario}
                </p>
              </div>

              <div className="flex flex-col gap-1 border-t border-dashboard-border pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide  text-gray-500 dark:text-gray-400">
                  Expected Output
                </div>
                <p className="text-sm whitespace-pre-wrap  text-gray-700 dark:text-gray-200">
                  {prompt.expected_output}
                </p>
              </div>

              {deadlineDate && (
                <div className="flex items-center gap-2 border-t border-dashboard-border pt-3 text-xs ">
                  <CalendarClock
                    className={`size-3.5 shrink-0 ${
                      deadlineOverdue
                        ? "text-red-500"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                  <span
                    className={
                      deadlineOverdue
                        ? "font-semibold text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-300"
                    }
                  >
                    Deadline: {deadlineDate.format("ddd, D MMM YYYY · HH:mm")}
                    {deadlineOverdue ? " (lewat)" : ""}
                  </span>
                </div>
              )}
            </div>

            {status === "ACCEPTED" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Diterima oleh champion
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Form */}
          <SectionContainerAILN
            title={isLocked ? "Submission kamu" : "Kirim tugasmu"}
            desc="Tulis prompt yang kamu pakai dan tempel output dari AI untuk direview."
          >
            <form className="flex flex-col gap-4">
              <FieldRow
                icon={<SquarePen className="size-4" />}
                label="Prompt yang kamu pakai"
                helper="Tulis prompt persis seperti yang kamu kirim ke AI."
                required
              >
                <div className="flex flex-col gap-1">
                  <TextAreaAILN
                    textAreaId="prompt-input"
                    textAreaPlaceholder="Tulis prompt yang kamu kirim ke AI…"
                    value={formData.input}
                    onTextAreaChange={(v) =>
                      setFormData((prev) => ({ ...prev, input: v }))
                    }
                    characterLength={5000}
                    textAreaHeight="min-h-[160px]"
                    variant="STUDENT"
                    disabled={isLocked}
                    required
                  />
                  <div className="self-end text-xs  text-gray-400">
                    {formData.input.length}/5000 karakter
                  </div>
                </div>
              </FieldRow>

              <FieldRow
                icon={<Sparkles className="size-4" />}
                label="Output dari AI"
                helper="Tempel hasil dari AI apa adanya, tanpa diedit."
                required
              >
                <div className="flex flex-col gap-1">
                  <TextAreaAILN
                    textAreaId="prompt-output"
                    textAreaPlaceholder="Tempel hasil dari AI…"
                    value={formData.output}
                    onTextAreaChange={(v) =>
                      setFormData((prev) => ({ ...prev, output: v }))
                    }
                    characterLength={10000}
                    textAreaHeight="min-h-[200px]"
                    variant="STUDENT"
                    disabled={isLocked}
                    required
                  />
                  <div className="self-end text-xs  text-gray-400">
                    {formData.output.length}/10000 karakter
                  </div>
                </div>
              </FieldRow>

              {!isLocked && (
                <DisabledActionButtonAILN
                  type="button"
                  variant="primary"
                  className="w-fit self-end"
                >
                  <Send className="size-4" />
                  {status === "NEEDS_REVISION"
                    ? "Kirim Revisi"
                    : prompt.submitted_at
                      ? "Update Submission"
                      : "Kirim Tugas"}
                </DisabledActionButtonAILN>
              )}
              {isLocked && (
                <Link
                  href={`/${projectId}/student/skill-practice`}
                  className="self-center text-sm text-gray-500 underline dark:text-gray-400"
                >
                  Kembali ke daftar tugas
                </Link>
              )}
            </form>
          </SectionContainerAILN>
        </div>
      </div>
    </PageContainerAILN>
  );
}
