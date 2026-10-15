import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import type { LearningChapterRef, LearningDetailResult } from "./learnings";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type ChapterSurveyStatus = {
  available: boolean;
  submitted: boolean;
  submitted_at: string | null;
};

export type ChapterSurveyAnswer = {
  trainer_clarity: number;
  trainer_mastery: number;
  trainer_responsiveness: number;
  trainer_engagement: number;
  material_relevance: number;
  material_flow: number;
  material_depth: number;
  learning_value: number;
  favorite_material: string | null;
  missing_topics: string | null;
  disliked_material: string | null;
  improvement_suggestion: string | null;
  submitted_at: string;
};

export type ChapterSurveyDetail = {
  chapter: LearningChapterRef;
  session_date: string;
  available: boolean;
  response: ChapterSurveyAnswer | null;
};

export type ChapterSurveyInput = {
  trainer_clarity: number;
  trainer_mastery: number;
  trainer_responsiveness: number;
  trainer_engagement: number;
  material_relevance: number;
  material_flow: number;
  material_depth: number;
  learning_value: number;
  favorite_material: string | null;
  missing_topics: string | null;
  disliked_material: string | null;
  improvement_suggestion: string | null;
};

export type ChapterSurveyCallResult<T> =
  | { success: true; data: T }
  | { success: false; code: number; message: string };

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/chapter-surveys/details needs the caller's own session JWT — see docs/api/chapter-surveys.md in ailene-lms-backend.
export async function getChapterSurveyDetails(
  chapterId: number,
): Promise<LearningDetailResult<ChapterSurveyDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<ChapterSurveyDetail>(
    "/api/v1/chapter-surveys/details",
    { method: "POST", body: { chapter_id: chapterId }, token: sessionToken },
  );

  if (!result.success) {
    await LogError(
      "getChapterSurveyDetails",
      result.code,
      result.status,
      result.message,
    );
    if (result.message === "No access found for this project") {
      return { kind: "forbidden", reason: "no_access" };
    }
    if (result.status === "FORBIDDEN") {
      return { kind: "forbidden", reason: "chapter_locked" };
    }
    return { kind: "not_found" };
  }
  return result.data
    ? { kind: "ok", data: result.data }
    : { kind: "not_found" };
}

// POST /api/v1/chapter-surveys/submit needs the caller's own session JWT — see docs/api/chapter-surveys.md in ailene-lms-backend.
export async function submitChapterSurvey(
  chapterId: number,
  input: ChapterSurveyInput,
): Promise<ChapterSurveyCallResult<ChapterSurveyAnswer>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Sesi kamu sudah berakhir." };
  }

  const result = await callApi<ChapterSurveyAnswer>(
    "/api/v1/chapter-surveys/submit",
    {
      method: "POST",
      body: { chapter_id: chapterId, ...input },
      token: sessionToken,
    },
  );

  if (!result.success || !result.data) {
    await LogError(
      "submitChapterSurvey",
      result.code,
      result.status,
      result.message,
    );
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}
