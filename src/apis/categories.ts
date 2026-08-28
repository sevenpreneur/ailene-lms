import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type Category = { id: number; name: string };

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/categories needs the caller's own session JWT — see docs/api/categories.md in ailene-lms-backend.
export async function getCategories(): Promise<Category[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<Category[]>("/api/v1/categories", {
    method: "POST",
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getCategories",
      result.code,
      result.status,
      result.message
    );
    return [];
  }
  return result.data ?? [];
}
