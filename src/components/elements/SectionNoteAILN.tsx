import { ReactNode } from "react";

/**
 * Footer note inside a SectionContainerAILN — a top-bordered, muted caption
 * used across the pre-assessment sections for interpretive takeaways.
 */
export default function SectionNoteAILN({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 border-t border-dashboard-border pt-3 text-xs text-gray-500 dark:text-gray-400">
      {children}
    </p>
  );
}
