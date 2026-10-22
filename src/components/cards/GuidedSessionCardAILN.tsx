import type { GuidedSession } from "@/apis/use-cases";
import { GUIDED_STAGES } from "@/lib/guided-use-case";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function GuidedSessionCardAILN({
  session,
  projectId,
}: {
  session: GuidedSession;
  projectId: string;
}) {
  return (
    <Link
      href={`/${projectId}/student/skill-practice/guided?session_id=${session.id}`}
      className="group flex flex-col gap-4 rounded-lg border border-dashboard-border bg-card-2 p-5 transition hover:border-claude focus-visible:outline-2 focus-visible:outline-claude"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium text-claude dark:text-lime-bright">
          <Sparkles className="size-4" />
          Use Case pribadi
        </span>
        <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          Sedang dikerjakan
        </span>
      </div>
      <h3 className="line-clamp-2 text-lg font-medium">
        {session.daily_task || "Use Case pribadimu"}
      </h3>
      {session.summary && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {session.summary}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-dashboard-border pt-4 text-sm">
        <span className="text-muted-foreground">
          Langkah {session.current_step} dari 6 ·{" "}
          {GUIDED_STAGES[session.current_step - 1]?.title}
        </span>
        <span className="flex items-center gap-1.5 font-medium text-claude dark:text-lime-bright">
          Lanjutkan
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
