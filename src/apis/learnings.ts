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

// POST /api/learnings needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getLearnings(
  chapterId: number
): Promise<ChapterLearnings | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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
