import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type LearningQuiz = {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  question_count: number;
  xp_reward: number;
  xp_earned: number;
  best_score: number | null;
  attempts: number;
};

export type LearningVideo = {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  xp_reward: number;
  order_index: number;
  xp_earned: number;
  completed: boolean;
};

export type LearningMaterial = {
  id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  order_index: number;
  completed: boolean;
};

export type ChapterLearnings = {
  quizzes: LearningQuiz[];
  videos: LearningVideo[];
  materials: LearningMaterial[];
};

export type LearningChapterRef = { id: number; name: string };

export type MaterialDetail = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  file_url: string | null;
  image_url: string | null;
  xp_reward: number;
  order_index: number;
  chapter: LearningChapterRef;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoDetail = {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  xp_reward: number;
  order_index: number;
  chapter: LearningChapterRef;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuizDetailOption = { id: number; option_code: string; text: string };

export type QuizDetailQuestion = {
  id: number;
  question: string;
  order_index: number;
  xp_reward: number;
  options: QuizDetailOption[];
};

export type QuizDetail = {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  chapter: LearningChapterRef;
  question_count: number;
  xp_reward: number;
  attempts: number;
  questions: QuizDetailQuestion[];
};

export type LevelMaterialItem = {
  id: string;
  title: string;
  index: number;
  completed: boolean;
  locked: boolean;
  is_current: boolean;
};

export type LevelMaterials = {
  level_number: number;
  materials: LevelMaterialItem[];
};

export type MaterialCompletion = {
  material_id: string;
  completed: boolean;
  completed_at: string;
  xp_awarded: number;
};

export type VideoCompletion = {
  video_id: number;
  completed: boolean;
  completed_at: string;
  xp_awarded: number;
};

// Backend returns 404/NOT_FOUND for both "no such row" and "no project access" — only the message tells them apart.
const NO_PROJECT_ACCESS_MESSAGE = "No access found for this project";

export type LearningDetailResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "forbidden" }
  | { kind: "not_found" };

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/learnings needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getLearnings(
  chapterId: number
): Promise<ChapterLearnings | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<ChapterLearnings>("/api/learnings", {
    method: "POST",
    body: { chapter_id: chapterId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getLearnings", result.code, result.status, result.message);
    return null;
  }
  return result.data ?? null;
}

// POST /api/learnings/material-details needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getMaterialDetails(
  materialId: string
): Promise<LearningDetailResult<MaterialDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<MaterialDetail>(
    "/api/learnings/material-details",
    {
      method: "POST",
      body: { material_id: materialId },
      token: sessionToken,
    }
  );

  if (!result.success) {
    await LogError(
      "getMaterialDetails",
      result.code,
      result.status,
      result.message
    );
    return result.message === NO_PROJECT_ACCESS_MESSAGE
      ? { kind: "forbidden" }
      : { kind: "not_found" };
  }
  return result.data ? { kind: "ok", data: result.data } : { kind: "not_found" };
}

// POST /api/learnings/video-details needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getVideoDetails(
  videoId: number
): Promise<LearningDetailResult<VideoDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<VideoDetail>("/api/learnings/video-details", {
    method: "POST",
    body: { video_id: videoId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getVideoDetails",
      result.code,
      result.status,
      result.message
    );
    return result.message === NO_PROJECT_ACCESS_MESSAGE
      ? { kind: "forbidden" }
      : { kind: "not_found" };
  }
  return result.data ? { kind: "ok", data: result.data } : { kind: "not_found" };
}

// POST /api/learnings/quiz-details needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getQuizDetails(
  quizId: string
): Promise<LearningDetailResult<QuizDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<QuizDetail>("/api/learnings/quiz-details", {
    method: "POST",
    body: { quiz_id: quizId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getQuizDetails",
      result.code,
      result.status,
      result.message
    );
    return result.message === NO_PROJECT_ACCESS_MESSAGE
      ? { kind: "forbidden" }
      : { kind: "not_found" };
  }
  return result.data ? { kind: "ok", data: result.data } : { kind: "not_found" };
}

// POST /api/learnings/materials needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getLevelMaterials(
  materialId: string
): Promise<LevelMaterials | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<LevelMaterials>("/api/learnings/materials", {
    method: "POST",
    body: { material_id: materialId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getLevelMaterials",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}

// POST /api/learnings/material-completion needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function completeMaterial(
  materialId: string
): Promise<MaterialCompletion | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<MaterialCompletion>(
    "/api/learnings/material-completion",
    {
      method: "POST",
      body: { material_id: materialId },
      token: sessionToken,
    }
  );

  if (!result.success) {
    await LogError(
      "completeMaterial",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}

// POST /api/learnings/video-completion needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function completeVideo(
  videoId: number
): Promise<VideoCompletion | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<VideoCompletion>(
    "/api/learnings/video-completion",
    {
      method: "POST",
      body: { video_id: videoId },
      token: sessionToken,
    }
  );

  if (!result.success) {
    await LogError(
      "completeVideo",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}
