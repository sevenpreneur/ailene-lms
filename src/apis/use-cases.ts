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
  categories: UseCaseCategory[];
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

// POST /api/use-cases needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function getUseCases(
  projectId: string,
  options?: { search?: string; page?: number; page_size?: number }
): Promise<{ list: UseCaseLibraryItem[]; metapaging: Metapaging | null }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], metapaging: null };

  const result = await callApi<{ list: UseCaseLibraryItem[]; metapaging: Metapaging }>(
    "/api/use-cases",
    {
      method: "POST",
      body: { project_id: projectId, ...options },
      token: sessionToken,
    }
  );

  if (!result.success) {
    await LogError("getUseCases", result.code, result.status, result.message);
    return { list: [], metapaging: null };
  }
  return result.data ?? { list: [], metapaging: null };
}

// POST /api/use-cases/assigned needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function getAssignedUseCases(
  projectId: string,
  options?: { has_submitted?: boolean; is_accepted?: boolean }
): Promise<AssignedUseCase[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<AssignedUseCase[]>("/api/use-cases/assigned", {
    method: "POST",
    body: { project_id: projectId, ...options },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getAssignedUseCases", result.code, result.status, result.message);
    return [];
  }
  return result.data ?? [];
}
