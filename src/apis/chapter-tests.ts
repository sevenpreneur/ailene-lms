import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import type { LearningChapterRef, LearningDetailResult } from "./learnings";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type ChapterTestKind = "pre_test" | "post_test";

export type ChapterTestQuestionType = "multiple_choice" | "essay";

export type ChapterTestLockedReason =
  | "pre_test_required"
  | "materials_incomplete"
  | "post_test_submitted"
  | "test_locked";

export type ChapterTestTask = {
  id: number;
  kind: ChapterTestKind;
  name: string;
  description: string | null;
  question_count: number;
  submitted: boolean;
  score: number | null;
  submitted_at: string | null;
  available: boolean;
  locked_reason: ChapterTestLockedReason | null;
};

export type ChapterTestOption = {
  id: number;
  option_code: string;
  text: string;
};

export type ChapterTestQuestion = {
  id: number;
  type: ChapterTestQuestionType;
  question: string;
  order_index: number;
  options: ChapterTestOption[];
};

export type ChapterTestDetail = {
  id: number;
  kind: ChapterTestKind;
  name: string;
  description: string | null;
  chapter: LearningChapterRef;
  question_count: number;
  choice_count: number;
  essay_count: number;
  submitted: boolean;
  available: boolean;
  locked_reason: ChapterTestLockedReason | null;
  questions: ChapterTestQuestion[];
};

export type ChapterTestAnswers = Record<string, string>;

export type ChapterTestSubmitResult = {
  score: number | null;
  correct_count: number;
  choice_count: number;
  essay_count: number;
  submitted_at: string;
};

export type ChapterTestResultQuestion = {
  id: number;
  type: ChapterTestQuestionType;
  question: string;
  order_index: number;
  explanation: string | null;
  options: (ChapterTestOption & { is_correct: boolean | null })[];
  answer: string | null;
  is_correct: boolean | null;
};

export type ChapterTestResult = {
  id: number;
  kind: ChapterTestKind;
  name: string;
  description: string | null;
  chapter: LearningChapterRef;
  answers_revealed: boolean;
  submission: {
    score: number | null;
    correct_count: number;
    choice_count: number;
    submitted_at: string;
  };
  questions: ChapterTestResultQuestion[];
  pre_test_score: number | null;
};

export type ChapterTestCallResult<T> =
  | { success: true; data: T }
  | { success: false; code: number; message: string };

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v2/chapter-tests needs the caller's own session JWT — see docs/api/chapter-tests.md in ailene-lms-apis.
export async function getChapterTests(
  chapterId: number,
): Promise<ChapterTestTask[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<ChapterTestTask[]>("/api/v2/chapter-tests", {
    method: "POST",
    body: { chapter_id: chapterId },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    await LogError(
      "getChapterTests",
      result.code,
      result.status,
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? [];
}

// POST /api/v2/chapter-tests/details needs the caller's own session JWT — see docs/api/chapter-tests.md in ailene-lms-apis.
export async function getChapterTestDetails(
  testId: number,
): Promise<LearningDetailResult<ChapterTestDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<ChapterTestDetail>(
    "/api/v2/chapter-tests/details",
    {
      method: "POST",
      body: { test_id: testId },
      token: sessionToken,
      backend: "lms",
    },
  );

  if (!result.success) {
    await LogError(
      "getChapterTestDetails",
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
    if (result.code === 404) return { kind: "not_found" };
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data
    ? { kind: "ok", data: result.data }
    : { kind: "not_found" };
}

// POST /api/v2/chapter-tests/submit needs the caller's own session JWT — see docs/api/chapter-tests.md in ailene-lms-apis.
export async function submitChapterTest(
  testId: number,
  answers: ChapterTestAnswers,
): Promise<ChapterTestCallResult<ChapterTestSubmitResult>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Sesi kamu sudah berakhir." };
  }

  const result = await callApi<ChapterTestSubmitResult>(
    "/api/v2/chapter-tests/submit",
    {
      method: "POST",
      body: { test_id: testId, answers },
      token: sessionToken,
      backend: "lms",
    },
  );

  if (!result.success || !result.data) {
    await LogError(
      "submitChapterTest",
      result.code,
      result.status,
      result.message,
    );
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}

// POST /api/v2/chapter-tests/result needs the caller's own session JWT — see docs/api/chapter-tests.md in ailene-lms-apis.
export async function getChapterTestResult(
  testId: number,
): Promise<ChapterTestResult | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<ChapterTestResult>(
    "/api/v2/chapter-tests/result",
    {
      method: "POST",
      body: { test_id: testId },
      token: sessionToken,
      backend: "lms",
    },
  );

  if (!result.success) {
    await LogError(
      "getChapterTestResult",
      result.code,
      result.status,
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? null;
}
