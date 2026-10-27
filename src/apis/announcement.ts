import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type Announcement = {
  id: number;
  project_id: string;
  title: string;
  callout: string | null;
  status: "active" | "inactive";
  start_date: string;
  end_date: string;
  updated_at: string;
};

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v2/announcements/details needs the caller's own session JWT — see docs/api/announcements.md in ailene-lms-apis.
export async function getAnnouncementDetails(
  projectId: string,
): Promise<Announcement | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<Announcement>(
    "/api/v2/announcements/details",
    {
      method: "POST",
      body: { project_id: projectId },
      token: sessionToken,
      backend: "lms",
    },
  );

  if (!result.success) {
    if (result.message === "Announcement not found") return null;
    await LogError(
      "getAnnouncementDetails",
      result.code,
      result.status,
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? null;
}
