import { WORKFLOW_FEEDBACK_LABELS } from "@/lib/workflow-map";
import type { WorkflowFeedback } from "@/apis/workflows";
import { HelpCircle, Lightbulb, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const KIND_ICON = {
  automate: Sparkles,
  improve: Lightbulb,
  question: HelpCircle,
} as const;

export default function WorkflowFeedbackItemAILN({
  feedback,
  context,
}: {
  feedback: WorkflowFeedback;
  context?: ReactNode;
}) {
  const Icon = KIND_ICON[feedback.kind];
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-sb-border bg-sb-bg/60 p-3.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <Icon className="size-3.5" aria-hidden />
          {WORKFLOW_FEEDBACK_LABELS[feedback.kind]}
        </span>
        {context}
      </div>
      <p className="text-sm leading-6 text-foreground">{feedback.body}</p>
      <p className="text-xs text-muted-foreground">
        {feedback.author.full_name}
      </p>
    </li>
  );
}
