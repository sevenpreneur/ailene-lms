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

export type StudentLevelProgress = {
  total_xp: number;
  current_level_number: number | null;
  current_level_name: string | null;
  tasks_required: number;
  tasks_done: number;
  next_level_unlockable: boolean;
  use_case_approved_count: number;
  prompt_approved_count: number;
  hours_saved_total: number;
  tools_mastered: string[];
};

export type StudentCompetencyDimension = {
  key: string;
  name: string;
  score: number;
};

export type StudentCompetency = {
  dimensions: StudentCompetencyDimension[];
  avg: number;
  current_level_number: number | null;
  tier_number: number;
  tier_name: string;
  next_tier: { number: number; name: string; avg_needed: number } | null;
};

export type StudentLeaderboardEntry = {
  rank: number;
  access_id: string;
  full_name: string;
  avatar: string | null;
  total_xp: number;
  is_me: boolean;
};

export type StudentLeaderboard = {
  group: { id: number; name: string } | null;
  my_rank: number;
  total: number;
  leaderboard: StudentLeaderboardEntry[];
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

// POST /api/v1/student/level-progress needs the caller's own session JWT — see docs/api/student.md in ailene-lms-backend.
export async function getStudentLevelProgress(
  projectId: string
): Promise<StudentLevelProgress | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<StudentLevelProgress>(
    "/api/v1/student/level-progress",
    {
      method: "POST",
      body: { project_id: projectId },
      token: sessionToken,
    }
  );

  if (!result.success) {
    await LogError(
      "getStudentLevelProgress",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}

// POST /api/v1/student/competency needs the caller's own session JWT — see docs/api/student.md in ailene-lms-backend.
export async function getStudentCompetency(
  projectId: string
): Promise<StudentCompetency | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<StudentCompetency>("/api/v1/student/competency", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getStudentCompetency",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}

// POST /api/v1/student/leaderboard needs the caller's own session JWT — see docs/api/student.md in ailene-lms-backend.
export async function getStudentLeaderboard(
  projectId: string
): Promise<StudentLeaderboard | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<StudentLeaderboard>(
    "/api/v1/student/leaderboard",
    {
      method: "POST",
      body: { project_id: projectId },
      token: sessionToken,
    }
  );

  if (!result.success) {
    await LogError(
      "getStudentLeaderboard",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}
