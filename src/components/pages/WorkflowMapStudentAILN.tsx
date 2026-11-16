"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import WorkflowStepCardAILN, {
  workflowStepTitleId,
} from "@/components/forms/workflow-map/WorkflowStepCardAILN";
import WorkflowFeedbackItemAILN from "@/components/items/WorkflowFeedbackItemAILN";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { GUIDED_FREQUENCIES } from "@/lib/guided-use-case";
import { cn } from "@/lib/utils";
import { useProjectId } from "@/lib/use-project-id";
import {
  WORKFLOW_EXAMPLE,
  WORKFLOW_MAX_STEPS,
  WORKFLOW_MIN_STEPS,
  WORKFLOW_STARTER_NODES,
  WORKFLOW_STATUS_LABELS,
  createWorkflowStep,
  toNodeInputs,
  workflowErrorMessage,
} from "@/lib/workflow-map";
import type {
  Workflow,
  WorkflowFrequency,
  WorkflowNodeInput,
} from "@/apis/workflows";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Flame,
  Loader2,
  MessagesSquare,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STATUS_ICON = {
  draft: PencilLine,
  submitted: Clock3,
  reviewed: CheckCircle2,
} as const;

const EMPTY_FEEDBACK: Workflow["feedback"] = [];

type Pending = "save" | "submit" | "delete" | null;

function SectionHeading({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-3 text-lg font-medium">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sevenpreneur-coal text-sm text-white dark:bg-white dark:text-sevenpreneur-coal"
        >
          {number}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

async function postWorkflow(
  action: "create" | "update" | "submit" | "delete",
  body: Record<string, unknown>,
): Promise<{ ok: true; data: Workflow } | { ok: false; message?: string }> {
  try {
    const response = await fetch(`/api/workflows/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    return response.ok
      ? { ok: true, data: payload as Workflow }
      : { ok: false, message: payload?.message };
  } catch {
    return { ok: false };
  }
}

// `initialMap` null = create a new map; otherwise edit that map.
export default function WorkflowMapStudentAILN({
  initialMap,
}: {
  initialMap: Workflow | null;
}) {
  const projectId = useProjectId();
  const router = useRouter();
  const listHref = `/${projectId}/student/workflow-maps`;
  const [saved, setSaved] = useState(initialMap);
  const feedback = saved?.feedback ?? EMPTY_FEEDBACK;
  const [title, setTitle] = useState(initialMap?.title ?? "");
  const [problem, setProblem] = useState(initialMap?.problem ?? "");
  const [frequency, setFrequency] = useState<WorkflowFrequency | null>(
    initialMap?.frequency ?? null,
  );
  const [nodes, setNodes] = useState(() =>
    initialMap ? toNodeInputs(initialMap.nodes) : WORKFLOW_STARTER_NODES,
  );
  const [showExample, setShowExample] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const focusStepRef = useRef<string | null>(null);

  const totalMinutes = nodes.reduce(
    (sum, node) => sum + (node.minutes ?? 0),
    0,
  );
  const painCount = nodes.filter((node) => node.pain_point).length;
  const stepNumbers = new Map(nodes.map((node, index) => [node.id, index + 1]));
  const generalFeedback = feedback.filter(
    (item) => !item.node_id || !stepNumbers.has(item.node_id),
  );
  const stepFeedback = feedback.filter(
    (item) => item.node_id && stepNumbers.has(item.node_id),
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const id = focusStepRef.current;
    if (!id) return;
    focusStepRef.current = null;
    document.getElementById(workflowStepTitleId(id))?.focus();
  }, [nodes]);

  const changeNodes = (
    update: (current: WorkflowNodeInput[]) => WorkflowNodeInput[],
  ) => {
    setDirty(true);
    setNodes(update);
  };

  const updateStep = (id: string, patch: Partial<WorkflowNodeInput>) =>
    changeNodes((current) =>
      current.map((node) => (node.id === id ? { ...node, ...patch } : node)),
    );

  const addStep = () => {
    if (nodes.length >= WORKFLOW_MAX_STEPS) return;
    const step = createWorkflowStep();
    focusStepRef.current = step.id;
    changeNodes((current) => [...current, step]);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= nodes.length) return;
    changeNodes((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeStep = (id: string) => {
    if (nodes.length <= WORKFLOW_MIN_STEPS) return;
    changeNodes((current) => current.filter((node) => node.id !== id));
  };

  const showStep = (id: string) => {
    document
      .getElementById(`workflow-step-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    document
      .getElementById(workflowStepTitleId(id))
      ?.focus({ preventScroll: true });
  };

  const applySaved = (workflow: Workflow) => {
    setSaved(workflow);
    setTitle(workflow.title ?? "");
    setProblem(workflow.problem ?? "");
    setFrequency(workflow.frequency);
    setNodes(toNodeInputs(workflow.nodes));
    setDirty(false);
  };

  // Persists the editor and returns the stored workflow, or null after showing an error.
  const persist = async (): Promise<Workflow | null> => {
    if (saved && !dirty) return saved;
    const content = { project_id: projectId, title, problem, frequency, nodes };
    const result = saved
      ? await postWorkflow("update", { ...content, workflow_id: saved.id })
      : await postWorkflow("create", content);
    if (!result.ok) {
      toast.error(
        workflowErrorMessage(result.message, "Peta alur belum dapat disimpan."),
      );
      return null;
    }
    applySaved(result.data);
    return result.data;
  };

  // A new map moves to its own URL; an existing one refreshes server data.
  const openSaved = (workflow: Workflow) => {
    if (initialMap) {
      router.refresh();
    } else {
      router.replace(`${listHref}/${workflow.id}`);
    }
  };

  const save = async () => {
    if (pending) return;
    setPending("save");
    const workflow = await persist();
    setPending(null);
    if (!workflow) return;
    toast.success(initialMap ? "Perubahan tersimpan." : "Draft tersimpan.");
    openSaved(workflow);
  };

  const submit = async () => {
    if (pending) return;
    setPending("submit");
    const workflow = await persist();
    if (!workflow) {
      setPending(null);
      return;
    }
    const result = await postWorkflow("submit", {
      project_id: projectId,
      workflow_id: workflow.id,
    });
    setPending(null);
    if (!result.ok) {
      toast.error(
        workflowErrorMessage(result.message, "Peta alur belum dapat disubmit."),
      );
      openSaved(workflow);
      return;
    }
    applySaved(result.data);
    toast.success("Peta alur berhasil disubmit.");
    openSaved(result.data);
  };

  const destroy = async () => {
    if (!saved || pending) return;
    setConfirmDelete(false);
    setPending("delete");
    const result = await postWorkflow("delete", {
      project_id: projectId,
      workflow_id: saved.id,
    });
    if (!result.ok) {
      setPending(null);
      toast.error(
        workflowErrorMessage(result.message, "Peta alur belum dapat dihapus."),
      );
      return;
    }
    setDirty(false);
    toast.success("Peta alur dihapus.");
    router.push(listHref);
    router.refresh();
  };

  const status = saved?.status ?? null;
  const StatusIcon = status ? STATUS_ICON[status] : null;
  const reviewedAt = saved?.reviewed_at ?? null;
  const emptyFeedbackText =
    status === "submitted"
      ? "Peta alurmu sudah disubmit dan menunggu masukan."
      : "Belum ada masukan. Submit peta alurmu supaya bisa diberi masukan.";

  return (
    <PageContainerAILN>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
        <div>
          <ButtonAILN variant="neutral" size="small" asChild>
            <Link href={`/${projectId}/student/workflow-maps`}>
              <ArrowLeft className="size-4" />
              Peta Alur Kerja
            </Link>
          </ButtonAILN>
        </div>

        <PageHeaderAILN
          title={initialMap ? "Edit Peta Alur" : "Peta Alur Baru"}
          desc="Gambarkan cara kamu mengerjakan tugas ini sekarang. Kita bedah bersama di kelas."
        >
          {status && StatusIcon && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                status === "reviewed"
                  ? "bg-sevenpreneur-coal text-white dark:bg-white dark:text-sevenpreneur-coal"
                  : "border border-sb-border bg-sb-bg text-sb-text-strong",
              )}
            >
              <StatusIcon className="size-3.5" aria-hidden />
              {WORKFLOW_STATUS_LABELS[status]}
            </span>
          )}
        </PageHeaderAILN>

        <section
          aria-labelledby="workflow-about"
          className="flex flex-col gap-4"
        >
          <SectionHeading
            id="workflow-about"
            number={1}
            title="Tentang pekerjaan ini"
          />
          <div className="flex flex-col gap-5 rounded-lg border border-dashboard-border bg-card-1 p-4 sm:p-5">
            <InputAILN
              inputId="workflow-title"
              inputName="Nama pekerjaan"
              inputPlaceholder="Contoh: Rekap laporan produksi harian"
              value={title}
              characterLength={100}
              onInputChange={(value) => {
                setDirty(true);
                setTitle(value);
              }}
              required
            />
            <TextAreaAILN
              textAreaId="workflow-problem"
              textAreaName="Apa masalahnya sekarang?"
              textAreaPlaceholder="Contoh: Sering telat karena datanya digabung manual."
              value={problem}
              rows={2}
              characterLength={400}
              onTextAreaChange={(value) => {
                setDirty(true);
                setProblem(value);
              }}
              required
            />
            <div className="flex flex-col gap-2">
              <span
                id="workflow-frequency"
                className="text-sm font-medium text-foreground"
              >
                Seberapa sering dikerjakan?
                <span className="text-destructive"> *</span>
              </span>
              <div
                role="radiogroup"
                aria-labelledby="workflow-frequency"
                className="flex flex-wrap gap-2"
              >
                {GUIDED_FREQUENCIES.map((option) => (
                  <ButtonAILN
                    key={option.value}
                    role="radio"
                    aria-checked={frequency === option.value}
                    variant={
                      frequency === option.value ? "optionActive" : "option"
                    }
                    size="medium"
                    onClick={() => {
                      setDirty(true);
                      setFrequency(option.value);
                    }}
                  >
                    {option.label}
                  </ButtonAILN>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="workflow-steps"
          className="flex flex-col gap-4"
        >
          <SectionHeading
            id="workflow-steps"
            number={2}
            title="Langkah-langkahnya"
          >
            <ButtonAILN
              variant="outline"
              size="small"
              aria-expanded={showExample}
              aria-controls="workflow-example"
              onClick={() => setShowExample((open) => !open)}
            >
              {showExample ? "Tutup contoh" : "Lihat contoh pengisian"}
            </ButtonAILN>
          </SectionHeading>
          <p className="text-sm text-muted-foreground">
            Tulis berurutan dari awal sampai pekerjaan selesai, apa adanya dan
            bukan versi idealnya. Minimal {WORKFLOW_MIN_STEPS} langkah, maksimal{" "}
            {WORKFLOW_MAX_STEPS}.
          </p>

          {showExample && (
            <div
              id="workflow-example"
              className="flex flex-col gap-3 rounded-lg border border-sb-border bg-sb-bg p-4 text-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contoh · {WORKFLOW_EXAMPLE.title} ({WORKFLOW_EXAMPLE.frequency})
              </p>
              <ol className="flex flex-col gap-3">
                {WORKFLOW_EXAMPLE.steps.map((step, index) => (
                  <li key={step.title} className="flex flex-col gap-0.5">
                    <span>
                      <span className="font-medium">Langkah {index + 1}:</span>{" "}
                      {step.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Dari {step.source} · {step.tool} · ±{step.minutes} menit
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <ol className="flex flex-col gap-3">
            {nodes.map((node, index) => (
              <WorkflowStepCardAILN
                key={node.id}
                step={node}
                number={index + 1}
                feedback={feedback.filter((item) => item.node_id === node.id)}
                canMoveEarlier={index > 0}
                canMoveLater={index < nodes.length - 1}
                canDelete={nodes.length > WORKFLOW_MIN_STEPS}
                onChange={(patch) => updateStep(node.id, patch)}
                onMove={(direction) => moveStep(index, direction)}
                onDelete={() => removeStep(node.id)}
              />
            ))}
          </ol>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <ButtonAILN
              variant="outline"
              size="medium"
              disabled={nodes.length >= WORKFLOW_MAX_STEPS}
              onClick={addStep}
            >
              <Plus className="size-3.5" />
              {nodes.length >= WORKFLOW_MAX_STEPS
                ? `Maksimal ${WORKFLOW_MAX_STEPS} langkah`
                : "Tambah langkah"}
            </ButtonAILN>
            <p
              className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {painCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Flame className="size-3.5" aria-hidden />
                  {painCount} paling repot
                </span>
              )}
              <span>
                Total waktu:{" "}
                <span className="font-medium text-foreground">
                  {totalMinutes} menit
                </span>{" "}
                sekali kerja
              </span>
            </p>
          </div>
        </section>

        {saved && (
          <section
            aria-labelledby="workflow-feedback"
            className="flex flex-col gap-4 rounded-lg border border-dashboard-border bg-card-1 p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sevenpreneur-coal text-white dark:bg-white dark:text-sevenpreneur-coal">
                  <MessagesSquare className="size-4" aria-hidden />
                </span>
                <div className="flex flex-col gap-0.5">
                  <h2 id="workflow-feedback" className="text-base font-medium">
                    Masukan dari kelas
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {reviewedAt
                      ? `Dibahas ${dayjs(reviewedAt).locale("id").format("D MMMM YYYY")}`
                      : "Masukan muncul di sini dan di langkah terkait setelah dibahas di kelas."}
                  </p>
                </div>
              </div>
            </div>

            {feedback.length === 0 ? (
              <p className="rounded-lg border border-dashed border-sb-border px-4 py-8 text-center text-sm text-muted-foreground">
                {emptyFeedbackText}
              </p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {generalFeedback.map((item) => (
                  <WorkflowFeedbackItemAILN
                    key={item.id}
                    feedback={item}
                    context={
                      <span className="text-muted-foreground">
                        · Keseluruhan alur
                      </span>
                    }
                  />
                ))}
                {stepFeedback.map((item) => (
                  <WorkflowFeedbackItemAILN
                    key={item.id}
                    feedback={item}
                    context={
                      <ButtonAILN
                        variant="textAccent"
                        size="bare"
                        onClick={() => item.node_id && showStep(item.node_id)}
                      >
                        · Lihat di Langkah{" "}
                        {item.node_id && stepNumbers.get(item.node_id)}
                      </ButtonAILN>
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="flex flex-col items-start gap-3 border-t border-dashboard-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="max-w-xl text-sm text-muted-foreground"
            aria-live="polite"
          >
            {dirty
              ? "Ada perubahan yang belum disimpan."
              : "Setelah submit, fasilitator memilih beberapa peta alur untuk dibedah bersama."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {saved && (
              <ButtonAILN
                variant="ghost"
                size="medium"
                disabled={pending !== null}
                onClick={() => setConfirmDelete(true)}
              >
                {pending === "delete" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Hapus peta
              </ButtonAILN>
            )}
            <ButtonAILN
              variant="outline"
              size="medium"
              disabled={pending !== null || (!!saved && !dirty)}
              onClick={save}
            >
              {pending === "save" && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              {saved ? "Simpan perubahan" : "Simpan draft"}
            </ButtonAILN>
            <ButtonAILN
              variant="primary"
              size="medium"
              disabled={pending !== null}
              onClick={submit}
            >
              {pending === "submit" && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Submit
            </ButtonAILN>
          </div>
        </div>
        <AlertConfirmDialogAILN
          isOpen={confirmDelete}
          alertDialogHeader="Hapus peta alur ini?"
          alertDialogMessage="Peta alur beserta semua langkah dan masukan kelas akan dihapus permanen."
          alertCancelLabel="Batal"
          alertConfirmLabel="Hapus permanen"
          onClose={() => setConfirmDelete(false)}
          onConfirm={destroy}
        />
      </div>
    </PageContainerAILN>
  );
}
