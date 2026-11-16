"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import WorkflowCanvasAILN from "@/components/forms/workflow-map/WorkflowCanvasAILN";
import WorkflowInspectorAILN, {
  WORKFLOW_TITLE_INPUT_ID,
} from "@/components/forms/workflow-map/WorkflowInspectorAILN";
import WorkflowFeedbackItemAILN from "@/components/items/WorkflowFeedbackItemAILN";
import AlertConfirmDialogAILN from "@/components/modals/AlertConfirmDialogAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { cn } from "@/lib/utils";
import { useProjectId } from "@/lib/use-project-id";
import {
  WORKFLOW_MAX_STEPS,
  WORKFLOW_NODE_LABELS,
  WORKFLOW_STARTER_NODES,
  WORKFLOW_STATUS_LABELS,
  createWorkflowStep,
  toNodeInput,
  workflowErrorMessage,
} from "@/lib/workflow-map";
import type { Workflow, WorkflowNodeInput } from "@/apis/workflows";
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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STATUS_ICON = {
  draft: PencilLine,
  submitted: Clock3,
  reviewed: CheckCircle2,
} as const;

const EMPTY_FEEDBACK: Workflow["feedback"] = [];

type Pending = "save" | "submit" | "delete" | null;

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
  const initialNodes =
    initialMap?.nodes.map(toNodeInput) ?? WORKFLOW_STARTER_NODES;
  const feedback = saved?.feedback ?? EMPTY_FEEDBACK;
  const [title, setTitle] = useState(initialMap?.title ?? "");
  const [problem, setProblem] = useState(initialMap?.problem ?? "");
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedId, setSelectedId] = useState(initialNodes[0]?.id ?? null);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inspectorRef = useRef<HTMLElement>(null);
  const focusTitleRef = useRef(false);

  const steps = nodes.filter((node) => node.kind === "step");
  const stepNumbers = new Map(steps.map((node, index) => [node.id, index + 1]));
  const totalMinutes = steps.reduce(
    (sum, node) => sum + (node.minutes ?? 0),
    0,
  );
  const painCount = steps.filter((node) => node.pain_point).length;
  const selectedIndex = nodes.findIndex((node) => node.id === selectedId);
  const selected = nodes[selectedIndex];

  const feedbackCountByNode = new Map<string, number>();
  for (const item of feedback) {
    if (item.node_id) {
      feedbackCountByNode.set(
        item.node_id,
        (feedbackCountByNode.get(item.node_id) ?? 0) + 1,
      );
    }
  }
  const generalFeedback = feedback.filter((item) => !item.node_id);
  const nodeFeedback = feedback.filter(
    (item) => item.node_id && nodes.some((node) => node.id === item.node_id),
  );

  const nodeLabel = (id: string | null) => {
    const node = nodes.find((item) => item.id === id);
    if (!node) return "";
    const number = stepNumbers.get(node.id);
    return `${WORKFLOW_NODE_LABELS[node.kind]}${number ? ` ${number}` : ""}`;
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!focusTitleRef.current) return;
    focusTitleRef.current = false;
    document.getElementById(WORKFLOW_TITLE_INPUT_ID)?.focus();
  }, [selectedId]);

  const select = (id: string) => {
    setSelectedId(id);
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      requestAnimationFrame(() =>
        inspectorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    }
  };

  const changeNodes = (
    update: (current: WorkflowNodeInput[]) => WorkflowNodeInput[],
  ) => {
    setDirty(true);
    setNodes(update);
  };

  const updateSelected = (patch: Partial<WorkflowNodeInput>) =>
    changeNodes((current) =>
      current.map((node) =>
        node.id === selectedId ? { ...node, ...patch } : node,
      ),
    );

  const insertAfter = (index: number) => {
    if (steps.length >= WORKFLOW_MAX_STEPS) return;
    const step = createWorkflowStep();
    changeNodes((current) => [
      ...current.slice(0, index + 1),
      step,
      ...current.slice(index + 1),
    ]);
    focusTitleRef.current = true;
    select(step.id);
  };

  const move = (direction: -1 | 1) => {
    const target = selectedIndex + direction;
    if (nodes[target]?.kind !== "step") return;
    changeNodes((current) => {
      const next = [...current];
      [next[selectedIndex], next[target]] = [next[target], next[selectedIndex]];
      return next;
    });
  };

  const remove = () => {
    if (steps.length <= 1) return;
    const fallback = nodes[selectedIndex - 1]?.id ?? nodes[0].id;
    changeNodes((current) => current.filter((node) => node.id !== selectedId));
    setSelectedId(fallback);
  };

  const applySaved = (workflow: Workflow) => {
    setSaved(workflow);
    setTitle(workflow.title ?? "");
    setProblem(workflow.problem ?? "");
    setNodes(workflow.nodes.map(toNodeInput));
    setDirty(false);
  };

  // Persists the editor and returns the stored workflow, or null after showing an error.
  const persist = async (): Promise<Workflow | null> => {
    if (saved && !dirty) return saved;
    const content = { project_id: projectId, title, problem, nodes };
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
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 pb-12">
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
          className="grid gap-5 rounded-lg border border-dashboard-border bg-card-1 p-4 sm:p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          <h2 id="workflow-about" className="sr-only">
            Tentang use case
          </h2>
          <InputAILN
            inputId="workflow-title"
            inputName="Nama pekerjaan"
            inputPlaceholder="Mis. Rekap laporan penjualan mingguan"
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
            textAreaPlaceholder="Mis. Sering telat karena datanya digabung manual."
            value={problem}
            rows={2}
            characterLength={400}
            onTextAreaChange={(value) => {
              setDirty(true);
              setProblem(value);
            }}
            required
          />
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section
            aria-labelledby="workflow-flow"
            className="flex min-w-0 flex-col gap-3"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 id="workflow-flow" className="text-base font-medium">
                  Alur kerja saat ini
                </h2>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{steps.length} langkah</span>
                  <span aria-hidden>·</span>
                  <span>±{totalMinutes} menit sekali jalan</span>
                  {painCount > 0 && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Flame className="size-3" aria-hidden />
                        {painCount} paling repot
                      </span>
                    </>
                  )}
                </p>
              </div>
              <ButtonAILN
                variant="outline"
                size="small"
                disabled={steps.length >= WORKFLOW_MAX_STEPS}
                onClick={() => insertAfter(nodes.length - 2)}
              >
                <Plus className="size-3.5" />
                Tambah langkah
              </ButtonAILN>
            </div>

            <WorkflowCanvasAILN
              nodes={nodes}
              selectedId={selectedId}
              feedbackCountByNode={feedbackCountByNode}
              onSelect={select}
              onInsertAfter={insertAfter}
            />

            <p className="text-xs leading-5 text-muted-foreground">
              Klik kartu untuk mengisi detail. Cukup 3–7 langkah, tulis apa
              adanya, bukan versi idealnya.
            </p>
          </section>

          {selected && (
            <div className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:overscroll-contain lg:rounded-lg">
              <WorkflowInspectorAILN
                ref={inspectorRef}
                node={selected}
                stepNumber={stepNumbers.get(selected.id) ?? null}
                feedback={feedback.filter(
                  (item) => item.node_id === selected.id,
                )}
                canMoveEarlier={nodes[selectedIndex - 1]?.kind === "step"}
                canMoveLater={nodes[selectedIndex + 1]?.kind === "step"}
                canDelete={steps.length > 1}
                onChange={updateSelected}
                onMove={move}
                onDelete={remove}
              />
            </div>
          )}
        </div>

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
                      : "Masukan muncul di sini dan di kartu terkait setelah dibahas di kelas."}
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
                {nodeFeedback.map((item) => (
                  <WorkflowFeedbackItemAILN
                    key={item.id}
                    feedback={item}
                    context={
                      <ButtonAILN
                        variant="textAccent"
                        size="bare"
                        onClick={() => item.node_id && select(item.node_id)}
                      >
                        · Lihat di {nodeLabel(item.node_id)}
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
          alertDialogMessage="Peta alur beserta semua kartu dan masukan kelas akan dihapus permanen."
          alertCancelLabel="Batal"
          alertConfirmLabel="Hapus permanen"
          onClose={() => setConfirmDelete(false)}
          onConfirm={destroy}
        />
      </div>
    </PageContainerAILN>
  );
}
