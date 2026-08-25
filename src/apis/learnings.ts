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
): Promise<MaterialDetail | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

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
    return null;
  }
  return result.data ?? null;
}

// POST /api/learnings/video-details needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getVideoDetails(
  videoId: number
): Promise<VideoDetail | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

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
    return null;
  }
  return result.data ?? null;
}

// POST /api/learnings/quiz-details needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getQuizDetails(
  quizId: string
): Promise<QuizDetail | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

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
    return null;
  }
  return result.data ?? null;
}
