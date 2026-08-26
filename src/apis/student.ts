import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type StudentStatus = {
  xp_count: number;
  current_level_number: number | null;
  has_pre_assessment: boolean;
};

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/student/status needs the caller's own session JWT — see docs/api/student.md in ailene-lms-backend.
export async function getStudentStatus(
  projectId: string
): Promise<StudentStatus | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<StudentStatus>("/api/v1/student/status", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getStudentStatus", result.code, result.status, result.message);
    return null;
  }
  return result.data ?? null;
}
