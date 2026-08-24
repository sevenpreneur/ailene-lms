import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type StudentStatus = {
  xp_count: number;
  current_level_number: number | null;
  has_pre_assessment: boolean;
};

// POST /api/student/status needs the caller's own session JWT — see docs/api/student.md in ailene-lms-backend.
export async function getStudentStatus(
  projectId: string
): Promise<StudentStatus | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<StudentStatus>("/api/student/status", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  return result.success && result.data ? result.data : null;
}
