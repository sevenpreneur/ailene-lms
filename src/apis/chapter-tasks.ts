import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import type { LearningChapterRef, LearningDetailResult } from "./learnings";
import type { Tool } from "./tools";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type ChapterTaskSubmissionStatus = "on_review" | "approved" | "rejected";

export type ChapterTaskStatus = "not_started" | ChapterTaskSubmissionStatus;

export type ChapterTask = {
  id: number;
  chapter: LearningChapterRef;
  tool: Tool;
  name: string;
  description: string | null;
  order_index: number;
  step_count: number;
  my_status: ChapterTaskStatus;
};

export type ChapterTaskStep = {
  step_number: number;
  instruction: string;
  image_url: string | null;
};

export type ChapterTaskSubmission = {
  id: number;
  status: ChapterTaskSubmissionStatus;
  proof_url: string;
  note: string | null;
  review_comment: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export type ChapterTaskDetail = ChapterTask & {
  steps: ChapterTaskStep[];
  my_submission: ChapterTaskSubmission | null;
};

export type ChapterTaskQueueItem = ChapterTaskSubmission & {
  reviewer: {
    role: "champion" | "administrator";
    access_id: string | null;
    full_name: string | null;
  } | null;
  student: {
    access_id: string;
    full_name: string;
    avatar: string | null;
    group: { id: number; name: string };
  };
  task: { id: number; name: string; chapter: LearningChapterRef };
  tool: Tool;
};

export type ChapterTaskQueue = {
  list: ChapterTaskQueueItem[];
  metapaging: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type ChapterTaskQueueFilter = {
  status?: ChapterTaskSubmissionStatus;
  chapter_id?: number;
  page?: number;
};

export type ChapterTaskReviewDecision = "approve" | "reject";

export type ChapterTaskCallResult<T> =
  | { success: true; data: T }
  | { success: false; code: number; message: string };

const NO_PROJECT_ACCESS_MESSAGE = "No access found for this project";

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

async function chapterTaskWrite<T>(
  name: string,
  path: string,
  body: Record<string, unknown>,
): Promise<ChapterTaskCallResult<T>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Sesi kamu sudah berakhir." };
  }

  const result = await callApi<T>(path, {
    method: "POST",
    body,
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success || !result.data) {
    await LogError(name, result.code, result.status, result.message);
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}

// POST /api/v2/chapter-tasks accepts one chapter or project filter and needs the caller's own session JWT.
export type ChapterTaskListInput =
  | { chapterId: number; projectId?: never }
  | { projectId: string; chapterId?: never };

export async function getChapterTasks(
  input: ChapterTaskListInput,
): Promise<ChapterTask[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<ChapterTask[]>("/api/v2/chapter-tasks", {
    method: "POST",
    body:
      "chapterId" in input
        ? { chapter_id: input.chapterId }
        : { project_id: input.projectId },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    await LogError(
      "getChapterTasks",
      result.code,
      result.status,
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? [];
}

// POST /api/v2/chapter-tasks/details needs the caller's own session JWT — see docs/api/chapter-tasks.md in ailene-lms-apis.
export async function getChapterTaskDetails(
  taskId: number,
): Promise<LearningDetailResult<ChapterTaskDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<ChapterTaskDetail>(
    "/api/v2/chapter-tasks/details",
    {
      method: "POST",
      body: { task_id: taskId },
      token: sessionToken,
      backend: "lms",
    },
  );

  if (!result.success) {
    await LogError(
      "getChapterTaskDetails",
      result.code,
      result.status,
      result.message,
    );
    if (result.message === NO_PROJECT_ACCESS_MESSAGE) {
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

// POST /api/v2/chapter-tasks/submit needs the caller's own session JWT — see docs/api/chapter-tasks.md in ailene-lms-apis.
export function submitChapterTask(input: {
  task_id: number;
  proof_url: string;
  note: string | null;
}) {
  return chapterTaskWrite<ChapterTaskSubmission>(
    "submitChapterTask",
    "/api/v2/chapter-tasks/submit",
    input,
  );
}

// POST /api/v2/chapter-task-submissions limits a champion session to their own group — see docs/api/chapter-tasks.md in ailene-lms-apis.
export async function getChapterTaskSubmissions(
  projectId: string,
  filter: ChapterTaskQueueFilter,
): Promise<ChapterTaskQueue | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<ChapterTaskQueue>(
    "/api/v2/chapter-task-submissions",
    {
      method: "POST",
      body: { project_id: projectId, ...filter },
      token: sessionToken,
      backend: "lms",
    },
  );

  if (!result.success) {
    await LogError(
      "getChapterTaskSubmissions",
      result.code,
      result.status,
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? null;
}

// POST /api/v2/chapter-task-submissions/review requires a champion of the learner's group — see docs/api/chapter-tasks.md in ailene-lms-apis.
export function reviewChapterTaskSubmission(input: {
  submission_id: number;
  decision: ChapterTaskReviewDecision;
  comment: string | null;
}) {
  return chapterTaskWrite<ChapterTaskQueueItem>(
    "reviewChapterTaskSubmission",
    "/api/v2/chapter-task-submissions/review",
    input,
  );
}
