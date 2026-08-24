"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import AppPageState from "@/components/states/AppPageState";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock,
  FileText,
  Layers,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  SquarePen,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  sessionToken,
  promptId,
}: {
  sessionToken: string;
  promptId: number;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const router = useRouter();
  const projectId = useProjectId();
  const utils = trpc.useUtils();
  const assignmentQ = trpc.read.promptAssignment.useQuery({
    prompt_id: promptId,
  });
  const submitM = trpc.update.submitPromptAssignment.useMutation();

  const a = assignmentQ.data?.assignment;

  const [formData, setFormData] = useState<{
    input: string;
    output: string;
  }>({
    input: "",
    output: "",
  });

  useEffect(() => {
    if (!a) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      input: a.input ?? "",
      output: a.output ?? "",
    });
  }, [a]);

  const status: Status = useMemo(() => {
    if (!a) return "PENDING_SUBMIT";
    if (a.is_accepted) return "ACCEPTED";
    if (!a.submitted_at) return "PENDING_SUBMIT";
    if (
      a.reviewed_at &&
      dayjs(a.reviewed_at as unknown as string).isAfter(
        dayjs(a.submitted_at as unknown as string)
      )
    )
      return "NEEDS_REVISION";
    return "AWAITING_REVIEW";
  }, [a]);

  if (assignmentQ.isLoading) {
    return (
      <PageContainerAILN>
        <div className="flex w-full items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </PageContainerAILN>
    );
  }

  if (assignmentQ.error) {
    if (assignmentQ.error.data?.code === "NOT_FOUND") {
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

  if (!a) {
    return (
      <PageContainerAILN>
        <AppPageState variant="NOT_FOUND" />
      </PageContainerAILN>
    );
  }

  const meta = statusMeta[status];
  const StatusIcon = meta.icon;
  const isLocked = status === "ACCEPTED";
  const deadline = a.deadline as unknown as string | null;
  const deadlineDate = deadline ? dayjs(deadline) : null;
  const deadlineOverdue =
    deadlineDate !== null && !a.is_accepted && deadlineDate.isBefore(dayjs());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.input.trim()) {
      toast.error("Input prompt tidak boleh kosong.");
      return;
    }
    if (!formData.output.trim()) {
      toast.error("Output tidak boleh kosong.");
      return;
    }
    submitM.mutate(
      {
        prompt_id: promptId,
        input: formData.input.trim(),
        output: formData.output.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Tugas berhasil dikirim.");
          utils.read.promptAssignment.invalidate({
            prompt_id: promptId,
          });
          utils.read.todayFocus.invalidate();
          utils.list.assignedPrompts.invalidate();
          utils.list.memberPromptLibrary.invalidate();
          utils.list.practiceSubmissions.invalidate();
          router.push(`/${projectId}/student/skill-practice`);
        },
        onError: (err) => {
          toast.error("Gagal kirim", { description: err.message });
        },
      }
    );
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <PageHeaderAILN title={a.prompt.name} />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <GeneralLabelAILN
              variant="red"
              icon={<Layers className="h-3 w-3" />}
            >
              Level {a.prompt.level.level_number}
            </GeneralLabelAILN>

            {a.prompt.categories.map((c) => (
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

          {a.message && (
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MessageSquare className="size-3.5 shrink-0 mt-0.5" />
              <span className="italic">&ldquo;{a.message}&rdquo;</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.8fr] lg:items-start">
          {/* LEFT: Detail prompt + champion review notes */}
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
                  {a.prompt.scenario}
                </p>
              </div>

              <div className="flex flex-col gap-1 border-t border-dashboard-border pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide  text-gray-500 dark:text-gray-400">
                  Expected Output
                </div>
                <p className="text-sm whitespace-pre-wrap  text-gray-700 dark:text-gray-200">
                  {a.prompt.expected_output}
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

            {status === "NEEDS_REVISION" && a.comment && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                  Catatan champion · perlu revisi
                </div>
                <p className="mt-1 text-sm text-red-700 dark:text-red-200">
                  {a.comment}
                </p>
              </div>
            )}
            {status === "ACCEPTED" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Diterima oleh champion
                </div>
                {a.comment && (
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
                    {a.comment}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Form */}
          <SectionContainerAILN
            title={isLocked ? "Submission kamu" : "Kirim tugasmu"}
            desc="Tulis prompt yang kamu pakai dan tempel output dari AI untuk direview."
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <ButtonAILN
                  type="submit"
                  variant="primary"
                  disabled={submitM.isPending}
                  className="w-fit self-end"
                >
                  {submitM.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Mengirim…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      {status === "NEEDS_REVISION"
                        ? "Kirim Revisi"
                        : a.submitted_at
                          ? "Update Submission"
                          : "Kirim Tugas"}
                    </>
                  )}
                </ButtonAILN>
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
