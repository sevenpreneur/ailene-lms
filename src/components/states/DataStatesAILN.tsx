import { ReactNode } from "react";

/**
 * Shared loading / empty placeholders for the Sponsor dashboards. Previously
 * each page redefined its own `Skeleton` / `SkeletonRows` / `EmptyHint`; these
 * are token-based (bg-muted, text-muted-foreground) so they theme correctly in
 * light and dark.
 */

/** A single pulsing block. Size it via `className` (e.g. "h-56", "h-24 w-full"). */
export function SkeletonBlockAILN({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

/** A vertical stack of equal-height skeleton rows. */
export function SkeletonRowsAILN({
  count = 5,
  rowClassName = "h-10",
  className = "gap-3",
}: {
  count?: number;
  rowClassName?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlockAILN key={i} className={rowClassName} />
      ))}
    </div>
  );
}

/** Centered muted hint for empty datasets. Default height via `className`. */
export function EmptyHintAILN({
  children = "Belum ada data.",
  className = "h-32",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center text-sm text-muted-foreground ${className}`}
    >
      {children}
    </div>
  );
}

/** Boxed muted empty state (used inside list sections). */
export function EmptyStateAILN({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
