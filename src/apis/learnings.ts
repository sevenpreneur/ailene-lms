import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type LearningVideoTimestamp = {
  start_seconds: number;
  title: string;
};

export type LearningChapterRef = { id: number; name: string };

export type StudentLevel = {
  id: number;
  level_number: number;
  name: string;
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

export type ChapterVideo = VideoDetail & {
  timestamps: LearningVideoTimestamp[];
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
  | { kind: "forbidden"; reason: "no_access" | "chapter_locked" }
  | { kind: "not_found" };

function toLearningDetailFailure<T>(
  message: string,
  status: string,
): LearningDetailResult<T> {
  if (message === NO_PROJECT_ACCESS_MESSAGE) {
    return { kind: "forbidden", reason: "no_access" };
  }
  if (status === "FORBIDDEN") {
    return { kind: "forbidden", reason: "chapter_locked" };
  }
  return { kind: "not_found" };
}
async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/learnings/levels needs the caller's own session JWT — see docs/api/learnings.md in ailene-lms-backend.
export async function getStudentLevels(
  projectId: string,
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
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? [];
}

// POST /api/v2/materials needs the caller's own session JWT — see docs/api/materials.md in ailene-lms-apis.
export async function getChapterMaterials(
  chapterId: number,
): Promise<MaterialDetail[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<MaterialDetail[]>("/api/v2/materials", {
    method: "POST",
    body: { chapter_id: chapterId },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    await LogError(
      "getChapterMaterials",
      result.code,
      result.status,
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? [];
}

// POST /api/v2/videos needs the caller's own session JWT — see docs/api/videos.md in ailene-lms-apis.
export async function getChapterVideos(
  chapterId: number,
): Promise<ChapterVideo[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<ChapterVideo[]>("/api/v2/videos", {
    method: "POST",
    body: { chapter_id: chapterId },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    await LogError(
      "getChapterVideos",
      result.code,
      result.status,
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? [];
}

// POST /api/v2/videos/details needs the caller's own session JWT — see docs/api/videos.md in ailene-lms-apis.
export async function getVideoDetails(
  videoId: number,
): Promise<LearningDetailResult<VideoDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<VideoDetail>("/api/v2/videos/details", {
    method: "POST",
    body: { video_id: videoId },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    if (result.code !== 403 && result.code !== 404)
      throw new Error("Data belum dapat dimuat.");
    await LogError(
      "getVideoDetails",
      result.code,
      result.status,
      result.message,
    );
    return toLearningDetailFailure(result.message, result.status);
  }
  return result.data
    ? { kind: "ok", data: result.data }
    : { kind: "not_found" };
}

// POST /api/v2/materials/completion needs the caller's own session JWT — see docs/api/materials.md in ailene-lms-apis.
export async function completeMaterial(
  materialId: string,
): Promise<MaterialCompletion | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<MaterialCompletion>(
    "/api/v2/materials/completion",
    {
      method: "POST",
      body: { material_id: materialId },
      token: sessionToken,
      backend: "lms",
    },
  );

  if (!result.success) {
    await LogError(
      "completeMaterial",
      result.code,
      result.status,
      result.message,
    );
    return null;
  }
  return result.data ?? null;
}

// POST /api/v2/videos/completion needs the caller's own session JWT — see docs/api/videos.md in ailene-lms-apis.
export async function completeVideo(
  videoId: number,
): Promise<VideoCompletion | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<VideoCompletion>("/api/v2/videos/completion", {
    method: "POST",
    body: { video_id: videoId },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    await LogError("completeVideo", result.code, result.status, result.message);
    return null;
  }
  return result.data ?? null;
}
