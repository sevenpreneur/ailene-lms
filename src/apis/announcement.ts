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

// POST /api/v1/announcement/details needs the caller's own session JWT — see docs/api/announcement.md in ailene-lms-backend.
export async function getAnnouncementDetails(
  projectId: string
): Promise<Announcement | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<Announcement>("/api/v1/announcement/details", {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getAnnouncementDetails",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data ?? null;
}
