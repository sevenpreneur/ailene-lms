"use client";

import { useParams } from "next/navigation";

// Reads the /[project_id]/... segment; pass `override` outside that route.
export function useProjectId(override?: string): string {
  const params = useParams<{ project_id: string }>();
  return override ?? params.project_id;
}
