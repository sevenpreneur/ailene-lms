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
  active_attempt_started_at: string | null;
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

export type QuizAnswers = Record<string, string | null>;

export type QuizAttemptState = {
  status: "active" | "finalized";
  submission_id: number | null;
  started_at: string | null;
  server_now: string | null;
  seconds_left: number | null;
  answers: QuizAnswers | null;
};

export type QuizUpdateResult = {
  status: "active" | "finalized";
};

export type QuizSubmitResult = {
  score: number;
  xp_awarded: number;
  attempt_number: number;
};

export type QuizResultOption = {
  id: number;
  option_code: string;
  text: string;
  is_correct: boolean;
};

export type QuizResultQuestion = {
  id: number;
  question: string;
  order_index: number;
  xp_reward: number;
  explanation: string | null;
  options: QuizResultOption[];
};

export type QuizResult = {
  id: string;
  name: string;
  description: string | null;
  chapter: LearningChapterRef;
  questions: QuizResultQuestion[];
  submission: {
    attempt_number: number;
    score: number;
    answers: QuizAnswers;
    submitted_at: string;
  };
  xp_earned: number;
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
  | { kind: "forbidden"; reason: "no_access" | "level_locked" }
  | { kind: "not_found" };

function toLearningDetailFailure<T>(
  message: string,
  status: string
): LearningDetailResult<T> {
  if (message === NO_PROJECT_ACCESS_MESSAGE) {
    return { kind: "forbidden", reason: "no_access" };
  }
  if (status === "FORBIDDEN") {
    return { kind: "forbidden", reason: "level_locked" };
  }
  return { kind: "not_found" };
}

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/learnings/task needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getLearnings(
  chapterId: number
): Promise<ChapterLearnings | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<ChapterLearnings>("/api/v1/learnings/task", {
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

// POST /api/v1/learnings/chapters needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getStudentChapters(
  projectId: string
): Promise<StudentChapter[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<StudentChapter[]>("/api/v1/learnings/chapters", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getStudentChapters",
      result.code,
      result.status,
      result.message
    );
    return [];
  }
  return result.data ?? [];
}

// POST /api/v1/learnings/levels needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getStudentLevels(
  projectId: string
): Promise<StudentLevel[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<StudentLevel[]>("/api/v1/learnings/levels", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getStudentLevels",
      result.code,
      result.status,
      result.message
    );
    return [];
  }
  return result.data ?? [];
}

// POST /api/v1/materials/details needs the caller's own session JWT — see docs/api/materials.md in ailene-lms-backend.
export async function getMaterialDetails(
  materialId: string
): Promise<LearningDetailResult<MaterialDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<MaterialDetail>("/api/v1/materials/details", {
    method: "POST",
    body: { material_id: materialId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getMaterialDetails",
      result.code,
      result.status,
      result.message
    );
    return toLearningDetailFailure(result.message, result.status);
  }
  return result.data ? { kind: "ok", data: result.data } : { kind: "not_found" };
}

// POST /api/v1/materials/in-level needs the caller's own session JWT — see docs/api/materials.md in ailene-lms-backend.
export async function getLevelMaterials(
  materialId: string
): Promise<LevelMaterials | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<LevelMaterials>("/api/v1/materials/in-level", {
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

// POST /api/v1/videos/details needs the caller's own session JWT — see docs/api/videos.md in ailene-lms-backend.
export async function getVideoDetails(
  videoId: number
): Promise<LearningDetailResult<VideoDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<VideoDetail>("/api/v1/videos/details", {
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
    return toLearningDetailFailure(result.message, result.status);
  }
  return result.data ? { kind: "ok", data: result.data } : { kind: "not_found" };
}

// POST /api/v1/quizzes/details needs the caller's own session JWT — see docs/api/quizzes.md in ailene-lms-backend.
export async function getQuizDetails(
  quizId: string
): Promise<LearningDetailResult<QuizDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<QuizDetail>("/api/v1/quizzes/details", {
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
    return toLearningDetailFailure(result.message, result.status);
  }
  return result.data ? { kind: "ok", data: result.data } : { kind: "not_found" };
}

// POST /api/v1/quizzes/attempt needs the caller's own session JWT — see docs/api/quizzes.md in ailene-lms-backend.
export async function startQuizAttempt(
  quizId: string
): Promise<QuizAttemptState | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<QuizAttemptState>("/api/v1/quizzes/attempt", {
    method: "POST",
    body: { quiz_id: quizId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "startQuizAttempt",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}

// POST /api/v1/quizzes/update needs the caller's own session JWT — see docs/api/quizzes.md in ailene-lms-backend.
export async function updateQuizAnswers(
  quizId: string,
  answers: QuizAnswers
): Promise<QuizUpdateResult | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<QuizUpdateResult>("/api/v1/quizzes/update", {
    method: "POST",
    body: { quiz_id: quizId, answers },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "updateQuizAnswers",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}

// POST /api/v1/quizzes/submit needs the caller's own session JWT — see docs/api/quizzes.md in ailene-lms-backend.
export async function submitQuiz(
  quizId: string,
  answers: QuizAnswers
): Promise<QuizSubmitResult | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<QuizSubmitResult>("/api/v1/quizzes/submit", {
    method: "POST",
    body: { quiz_id: quizId, answers },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("submitQuiz", result.code, result.status, result.message);
    return null;
  }
  return result.data ?? null;
}

// POST /api/v1/quizzes/result needs the caller's own session JWT — see docs/api/quizzes.md in ailene-lms-backend.
export async function getQuizResult(quizId: string): Promise<QuizResult | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<QuizResult>("/api/v1/quizzes/result", {
    method: "POST",
    body: { quiz_id: quizId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getQuizResult", result.code, result.status, result.message);
    return null;
  }
  return result.data ?? null;
}

// POST /api/v1/materials/completion needs the caller's own session JWT — see docs/api/materials.md in ailene-lms-backend.
export async function completeMaterial(
  materialId: string
): Promise<MaterialCompletion | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<MaterialCompletion>(
    "/api/v1/materials/completion",
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

// POST /api/v1/videos/completion needs the caller's own session JWT — see docs/api/videos.md in ailene-lms-backend.
export async function completeVideo(
  videoId: number
): Promise<VideoCompletion | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<VideoCompletion>(
    "/api/v1/videos/completion",
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
