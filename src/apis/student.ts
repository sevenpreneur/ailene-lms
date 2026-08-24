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

export type StudentLevel = {
  id: number;
  level_number: number;
  name: string;
};

export type StudentChapter = {
  id: number;
  name: string;
  description: string | null;
  session_date: string;
  duration_minutes: number;
  location_name: string | null;
  location_url: string | null;
  method: "online" | "offline";
  level: StudentLevel;
  done_tasks: number;
  total_tasks: number;
  progress: "not_started" | "in_progress" | "completed";
};

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/student/status needs the caller's own session JWT — see docs/api/student.md in ailene-lms-backend.
export async function getStudentStatus(
  projectId: string
): Promise<StudentStatus | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<StudentStatus>("/api/student/status", {
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

// POST /api/student/levels needs the caller's own session JWT — see docs/api/student.md in ailene-lms-backend.
export async function getStudentLevels(
  projectId: string
): Promise<StudentLevel[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<StudentLevel[]>("/api/student/levels", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getStudentLevels", result.code, result.status, result.message);
    return [];
  }
  return result.data ?? [];
}

// POST /api/student/chapters needs the caller's own session JWT — see docs/api/student.md in ailene-lms-backend.
export async function getStudentChapters(
  projectId: string
): Promise<StudentChapter[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<StudentChapter[]>("/api/student/chapters", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getStudentChapters", result.code, result.status, result.message);
    return [];
  }
  return result.data ?? [];
}
