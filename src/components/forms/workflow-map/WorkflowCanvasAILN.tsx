"use client";

import WorkflowNodeCardAILN from "@/components/forms/workflow-map/WorkflowNodeCardAILN";
import { WORKFLOW_MAX_STEPS } from "@/lib/workflow-map";
import type { WorkflowNodeInput } from "@/apis/workflows";
import { Plus } from "lucide-react";
import { Fragment } from "react";

function Connector({
  canInsert,
  label,
  onInsert,
}: {
  canInsert: boolean;
  label: string;
  onInsert: () => void;
}) {
  return (
    <li className="relative flex h-12 w-full shrink-0 items-center justify-center">
      <span
        aria-hidden
        className="absolute left-1/2 h-full w-px -translate-x-1/2 bg-sb-text/30"
      />
      {canInsert && (
        <button
          type="button"
          onClick={onInsert}
          aria-label={label}
          title={label}
          className="relative flex size-7 items-center justify-center rounded-full border border-sb-border bg-card-1 text-sb-text shadow-xs transition-colors duration-150 after:absolute after:-inset-2 hover:border-sevenpreneur-coal hover:text-sevenpreneur-coal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevenpreneur-coal dark:hover:border-white dark:hover:text-white dark:focus-visible:outline-white"
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      )}
    </li>
  );
}

export default function WorkflowCanvasAILN({
  nodes,
  selectedId,
  feedbackCountByNode,
  onSelect,
  onInsertAfter,
}: {
  nodes: WorkflowNodeInput[];
  selectedId: string | null;
  feedbackCountByNode: Map<string, number>;
  onSelect: (id: string) => void;
  onInsertAfter: (index: number) => void;
}) {
  const steps = nodes.filter((node) => node.kind === "step");
  const stepNumbers = new Map(steps.map((node, index) => [node.id, index + 1]));
  const canInsert = steps.length < WORKFLOW_MAX_STEPS;

  return (
    <div className="rounded-lg border border-sb-border bg-sb-bg/60 [background-image:radial-gradient(circle,color-mix(in_oklab,var(--sb-text)_22%,transparent)_1px,transparent_1px)] [background-size:18px_18px]">
      <ol
        aria-label="Alur kerja saat ini"
        className="flex flex-col items-center px-4 py-8 sm:px-6"
      >
        {nodes.map((node, index) => {
          const next = nodes[index + 1];
          return (
            <Fragment key={node.id}>
              <li className="flex w-full justify-center">
                <WorkflowNodeCardAILN
                  node={node}
                  stepNumber={stepNumbers.get(node.id) ?? null}
                  selected={node.id === selectedId}
                  feedbackCount={feedbackCountByNode.get(node.id) ?? 0}
                  onSelect={() => onSelect(node.id)}
                />
              </li>
              {next && (
                <Connector
                  canInsert={canInsert}
                  label={`Tambah langkah setelah ${node.title || "kartu ini"}`}
                  onInsert={() => onInsertAfter(index)}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
