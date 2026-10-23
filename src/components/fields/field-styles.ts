import { cn } from "@/lib/utils";

// Shared by native controls and react-select, across every stakeholder role.
export const fieldLabelClass =
  "flex items-center gap-1 text-sm font-medium text-foreground";
export const fieldIconClass =
  "pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground [&>svg]:size-4";

export function fieldControlClass(error?: boolean, className?: string) {
  return cn(
    "min-h-11 w-full rounded-lg border border-dashboard-border bg-card-1 px-3 py-2.5 text-base leading-5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-claude focus:outline-none focus:ring-2 focus:ring-claude/15 dark:focus:border-lime-bright dark:focus:ring-lime-bright/15 sm:text-sm disabled:cursor-not-allowed disabled:bg-card-2 disabled:text-muted-foreground disabled:opacity-60",
    error &&
      "border-destructive focus:border-destructive focus:ring-destructive/15 dark:focus:border-destructive dark:focus:ring-destructive/15",
    className,
  );
}

export function fieldDescriptionId(
  id: string,
  error?: string,
  hint?: unknown,
  existing?: string,
) {
  return (
    [existing, hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined
  );
}
