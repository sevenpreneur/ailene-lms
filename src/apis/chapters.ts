import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import type { LearningChapterRef } from "./learnings";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type ChapterDetail = {
  id: number;
  level_id: number;
  level_number: number;
  level_name: string;
  name: string;
  description: string | null;
  project_name: string;
  company_name: string | null;
  company_image_url: string | null;
  session_date: string;
  duration_minutes: number;
  location_name: string;
  location_url: string;
  method: "online" | "offline";
  locked: boolean;
  locked_reason: "admin_locked" | null;
  done_tasks: number;
  total_tasks: number;
  progress: "not_started" | "in_progress" | "completed";
  next_chapter: LearningChapterRef | null;
};

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v2/chapters returns the caller's scheduled chapters in session order — see docs/api/chapters.md in ailene-lms-apis.
export async function getChapters(projectId: string): Promise<ChapterDetail[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<ChapterDetail[]>("/api/v2/chapters", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    await LogError("getChapters", result.code, result.status, result.message);
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? [];
}

// POST /api/v2/chapters/details needs the caller's session JWT; 403/404 both render as not found — see docs/api/chapters.md in ailene-lms-apis.
export async function getChapterDetails(
  projectId: string,
  chapterId: number,
): Promise<ChapterDetail | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<ChapterDetail>("/api/v2/chapters/details", {
    method: "POST",
    body: { project_id: projectId, chapter_id: chapterId },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    await LogError(
      "getChapterDetails",
      result.code,
      result.status,
      result.message,
    );
    if (result.code === 403 || result.code === 404) return null;
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? null;
}
