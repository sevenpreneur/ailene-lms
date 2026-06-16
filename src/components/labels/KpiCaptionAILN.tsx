import { ReactNode } from "react";

/**
 * Small supporting caption shown under a KPI value in the Sponsor scorecards.
 * Shared so the pre-assessment and outcome dashboards render the footer line
 * identically.
 */
export default function KpiCaptionAILN({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}
