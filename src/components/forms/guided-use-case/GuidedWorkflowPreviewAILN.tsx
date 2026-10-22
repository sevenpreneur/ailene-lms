"use client";

import type { GuidedSession, GuidedStep } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedStepCardAILN from "@/components/cards/GuidedStepCardAILN";
import { formatDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";

export default function GuidedWorkflowPreviewAILN({
  session,
  steps,
  action,
  loading,
}: {
  session: GuidedSession | null;
  steps: GuidedStep[];
  action: ReactNode;
  loading?: ReactNode;
}) {
  const workflowKey = steps.map((item) => item.id).join("-");
  const [selection, setSelection] = useState({ workflowKey, id: steps[0]?.id });
  const active =
    (selection.workflowKey === workflowKey &&
      steps.find((item) => item.id === selection.id)) ||
    steps[0];
  const activeIndex = steps.findIndex((item) => item.id === active?.id);
  const panelId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const buttonsRef = useRef(new Map<number, HTMLButtonElement>());
  const select = (item: GuidedStep) => {
    setSelection({ workflowKey, id: item.id });
    const list = listRef.current;
    const button = buttonsRef.current.get(item.id);
    if (list && button && list.scrollWidth > list.clientWidth) {
      list.scrollTo({
        left: button.offsetLeft - list.offsetLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section
        className="flex flex-col gap-4 rounded-lg border border-dashboard-border bg-card-1 p-4 sm:p-5"
        aria-label="Ringkasan workflow"
      >
        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-start">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {session?.summary ||
              "Pilih langkah untuk melihat instruksi, prompt, dan cara mengecek hasilnya."}
          </p>
          <div className="shrink-0 self-end sm:self-start">{action}</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-dashboard-border pt-3">
          <span className="flex items-center gap-2 text-sm">
            <span className="flex size-7 items-center justify-center rounded-lg bg-card-2">
              <Sparkles className="size-3.5 text-muted-foreground" />
            </span>
            <span className="font-medium">{steps.length} langkah</span>
          </span>
          <span
            aria-hidden
            className="hidden h-5 w-px bg-dashboard-border sm:block"
          />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              Tanpa AI{" "}
              <span className="ml-1 font-medium text-foreground">
                {session?.minutes_without_ai == null
                  ? "—"
                  : formatDecimal(session.minutes_without_ai)}{" "}
                menit
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-3.5 text-muted-foreground"
            />
            <span className="rounded-full bg-hijau-t/70 px-3 py-1 text-claude dark:bg-claude/15 dark:text-lime-bright">
              Estimasi dengan AI{" "}
              <span className="ml-1 font-medium">
                {session?.estimated_minutes_with_ai == null
                  ? "—"
                  : formatDecimal(session.estimated_minutes_with_ai)}{" "}
                menit
              </span>
            </span>
          </div>
        </div>
      </section>

      {loading ||
        (active && (
          <div className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <nav
              aria-label="Urutan langkah workflow"
              className="min-w-0 lg:sticky lg:top-6"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-medium">Alur kerja</h3>
                <span className="text-xs text-muted-foreground">
                  {steps.length} langkah
                </span>
              </div>
              <ol
                ref={listRef}
                className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:overflow-visible lg:pb-0"
              >
                {steps.map((item) => {
                  const selected = item.id === active.id;
                  return (
                    <li key={item.id} className="w-64 shrink-0 lg:w-full">
                      <button
                        ref={(node) => {
                          if (node) buttonsRef.current.set(item.id, node);
                          else buttonsRef.current.delete(item.id);
                        }}
                        type="button"
                        aria-current={selected ? "step" : undefined}
                        aria-controls={panelId}
                        onClick={() => select(item)}
                        className={cn(
                          "flex h-full w-full items-start gap-3 rounded-lg border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-claude",
                          selected
                            ? "border-claude/30 bg-card-1 shadow-sm dark:border-lime-bright/30"
                            : "border-transparent hover:border-dashboard-border hover:bg-card-1",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                            selected
                              ? "bg-sevenpreneur-coal text-white dark:bg-lime-bright dark:text-sevenpreneur-coal"
                              : "bg-card-2 text-muted-foreground",
                          )}
                        >
                          {String(item.order).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-sm leading-5",
                              selected
                                ? "font-medium text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {item.title}
                          </span>
                          <span className="mt-2 block truncate text-xs text-muted-foreground">
                            {item.suggested_tool} · {item.estimated_minutes}{" "}
                            menit
                          </span>
                        </span>
                        {selected && (
                          <ArrowRight
                            aria-hidden
                            className="mt-1 size-3.5 shrink-0 text-claude dark:text-lime-bright"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 hidden px-1 text-xs leading-5 text-muted-foreground">
                Tinjau alurnya dulu. Kamu akan menjalankan dan mencentang setiap
                langkah setelah ini.
              </p>
            </nav>

            <section
              id={panelId}
              aria-labelledby={`${panelId}-title`}
              className="min-w-0 overflow-hidden rounded-lg border border-dashboard-border bg-card-1 shadow-sm"
            >
              <header className="border-b border-dashboard-border p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium uppercase tracking-wide text-muted-foreground">
                      Langkah {String(active.order).padStart(2, "0")}
                    </span>
                    <span className="rounded-full border border-dashboard-border px-2.5 py-1 text-muted-foreground">
                      {active.suggested_tool}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Clock3 className="size-3.5" />±{active.estimated_minutes}{" "}
                    menit
                  </span>
                </div>
                <h3
                  id={`${panelId}-title`}
                  className="font-headline text-xl font-medium leading-snug"
                >
                  {active.title}
                </h3>
              </header>
              <div className="p-5 sm:p-6">
                <GuidedStepCardAILN
                  key={active.id}
                  step={active}
                  embedded
                  workspace
                />
              </div>
              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-dashboard-border bg-card-2/30 px-5 py-4 sm:px-6">
                <ButtonAILN
                  variant="ghost"
                  size="small"
                  disabled={activeIndex === 0}
                  onClick={() => select(steps[activeIndex - 1])}
                >
                  <ArrowLeft className="size-3.5" />
                  Sebelumnya
                </ButtonAILN>
                {activeIndex < steps.length - 1 ? (
                  <ButtonAILN
                    variant="outline"
                    size="small"
                    onClick={() => select(steps[activeIndex + 1])}
                  >
                    Langkah berikutnya
                    <ArrowRight className="size-3.5" />
                  </ButtonAILN>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5" />
                    Langkah terakhir
                  </span>
                )}
              </footer>
            </section>
          </div>
        ))}

      {!!session?.risks.length && (
        <details className="group rounded-lg border border-dashboard-border bg-card-1">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-claude">
            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 font-medium">
              Hal yang perlu diperhatikan
            </span>
            <span className="text-xs text-muted-foreground">
              {session.risks.length} catatan
            </span>
            <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
          </summary>
          <ul className="space-y-2 border-t border-dashboard-border px-5 py-4 text-sm leading-6 text-muted-foreground">
            {session.risks.map((risk) => (
              <li key={risk} className="flex items-start gap-2.5">
                <span className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {risk}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
