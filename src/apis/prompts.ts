import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type PromptCategory = { id: number; name: string };

export type PromptLibraryItem = {
  id: number;
  name: string;
  description: string;
  level_number: number;
  categories: PromptCategory[];
  deadline_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean | null;
};

export type Metapaging = {
  total_data: number;
  total_page: number;
  current_page: number;
  page_size: number;
};

export type AssignedPrompt = {
  id: number;
  name: string;
  description: string;
  level_id: number;
  level_number: number;
  categories: PromptCategory[];
  xp_reward: number;
  is_accepted: boolean;
  deadline_at: string | null;
  reviewed_at: string | null;
  submitted_at: string | null;
  assigned_by: { id: string; name: string; avatar: string | null };
};

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/prompts needs the caller's own session JWT — see docs/api/prompts.md in ailene-lms-backend.
export async function getPrompts(
  projectId: string,
  options?: { search?: string; page?: number; page_size?: number }
): Promise<{ list: PromptLibraryItem[]; metapaging: Metapaging | null }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], metapaging: null };

  const result = await callApi<{
    list: PromptLibraryItem[];
    metapaging: Metapaging;
  }>("/api/v1/prompts", {
    method: "POST",
    body: { project_id: projectId, ...options },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getPrompts", result.code, result.status, result.message);
    return { list: [], metapaging: null };
  }
  return result.data ?? { list: [], metapaging: null };
}

// POST /api/v1/prompts/assigned needs the caller's own session JWT — see docs/api/prompts.md in ailene-lms-backend.
export async function getAssignedPrompts(
  projectId: string,
  options?: { has_submitted?: boolean; is_accepted?: boolean }
): Promise<AssignedPrompt[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<AssignedPrompt[]>("/api/v1/prompts/assigned", {
    method: "POST",
    body: { project_id: projectId, ...options },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getAssignedPrompts",
      result.code,
      result.status,
      result.message
    );
    return [];
  }
  return result.data ?? [];
}
