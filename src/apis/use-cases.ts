import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type UseCaseCategory = { id: number; name: string };

export type UseCaseLibraryItem = {
  id: number;
  name: string;
  description: string;
  level_number: number;
  categories: UseCaseCategory[];
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

export type AssignedUseCase = {
  id: number;
  name: string;
  description: string;
  level_id: number;
  level_number: number;
  categories: UseCaseCategory[];
  xp_reward: number;
  is_accepted: boolean;
  deadline_at: string | null;
  reviewed_at: string | null;
  submitted_at: string | null;
  assigned_by: { id: string; name: string; avatar: string | null };
};

export type UseCaseDetail = {
  id: number;
  name: string;
  description: string;
  level_id: number;
  level_number: number;
  categories: UseCaseCategory[];
  xp_reward: number;
  is_self_created: boolean;
  deadline_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean | null;
};

export type UseCaseDetailResult =
  | { kind: "ok"; data: UseCaseDetail }
  | { kind: "not_found" };

export type SelfCreateUseCaseInput = {
  project_id: string;
  name: string;
  category_ids: number[];
  outcome_proof: string;
  hours_with_ai: number;
  hours_without_ai: number;
  description: string;
  ai_tool: string;
  frequency: "daily" | "weekly" | "monthly" | "occasionally";
  type:
    | "workflow_automation"
    | "content_creation"
    | "data_analysis"
    | "research"
    | "communication"
    | "decision_support"
    | "learning"
    | "other";
};

export type UseCaseMutationResult =
  | { success: true; data: UseCaseDetail }
  | { success: false; code: number; message: string };

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/use-cases needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function getUseCases(
  projectId: string,
  options?: { search?: string; page?: number; page_size?: number }
): Promise<{ list: UseCaseLibraryItem[]; metapaging: Metapaging | null }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], metapaging: null };

  const result = await callApi<{
    list: UseCaseLibraryItem[];
    metapaging: Metapaging;
  }>("/api/v1/use-cases", {
    method: "POST",
    body: { project_id: projectId, ...options },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getUseCases", result.code, result.status, result.message);
    return { list: [], metapaging: null };
  }
  return result.data ?? { list: [], metapaging: null };
}

// POST /api/v1/use-cases/assigned needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function getAssignedUseCases(
  projectId: string,
  options?: { has_submitted?: boolean; is_accepted?: boolean }
): Promise<AssignedUseCase[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<AssignedUseCase[]>(
    "/api/v1/use-cases/assigned",
    {
      method: "POST",
      body: { project_id: projectId, ...options },
      token: sessionToken,
    }
  );

  if (!result.success) {
    await LogError(
      "getAssignedUseCases",
      result.code,
      result.status,
      result.message
    );
    return [];
  }
  return result.data ?? [];
}

// POST /api/v1/use-cases/details needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function getUseCaseDetails(
  id: number
): Promise<UseCaseDetailResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<UseCaseDetail>("/api/v1/use-cases/details", {
    method: "POST",
    body: { id },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getUseCaseDetails",
      result.code,
      result.status,
      result.message
    );
    return { kind: "not_found" };
  }
  return result.data ? { kind: "ok", data: result.data } : { kind: "not_found" };
}

// POST /api/v1/use-cases/self-assign needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function selfAssignUseCase(
  useCaseId: number
): Promise<UseCaseMutationResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Not authenticated" };
  }

  const result = await callApi<UseCaseDetail>(
    "/api/v1/use-cases/self-assign",
    {
      method: "POST",
      body: { use_case_id: useCaseId },
      token: sessionToken,
    }
  );

  if (!result.success || !result.data) {
    await LogError(
      "selfAssignUseCase",
      result.code,
      result.status,
      result.message
    );
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}

// POST /api/v1/use-cases/self-create needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function selfCreateUseCase(
  input: SelfCreateUseCaseInput
): Promise<UseCaseMutationResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Not authenticated" };
  }

  const result = await callApi<UseCaseDetail>(
    "/api/v1/use-cases/self-create",
    {
      method: "POST",
      body: input,
      token: sessionToken,
    }
  );

  if (!result.success || !result.data) {
    await LogError(
      "selfCreateUseCase",
      result.code,
      result.status,
      result.message
    );
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}
