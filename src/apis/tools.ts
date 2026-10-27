import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type Tool = {
  id: number;
  name: string;
  image_url: string;
};

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v2/tools accepts the caller's session JWT and ignores the body — see docs/api/tools.md in ailene-lms-apis.
export async function getTools(): Promise<Tool[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<Tool[]>("/api/v2/tools", {
    method: "POST",
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success) {
    await LogError("getTools", result.code, result.status, result.message);
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? [];
}
