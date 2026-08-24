"use client";

import { useParams } from "next/navigation";

// Reads the /[project_id]/... segment for building project-scoped hrefs.
export function useProjectId(): string {
  const params = useParams<{ project_id: string }>();
  return params.project_id;
}
