import "server-only";

import { callApi } from "./api";

export type LmsLevel = {
  id: number;
  level_number: number;
  name: string;
};

// POST /api/levels is gated by the same static shared bearer as login/google — see docs/api/level.md in ailene-lms-backend.
export async function getLevels(projectId: string): Promise<LmsLevel[]> {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("CLIENT_SECRET is not configured");
  }

  const result = await callApi<LmsLevel[]>("/api/levels", {
    method: "POST",
    body: { project_id: projectId },
    token: clientSecret,
  });

  return result.success && result.data ? result.data : [];
}
