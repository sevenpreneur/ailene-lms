import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type CoachingNoteUser = {
  id: string;
  name: string;
  avatar: string | null;
};

export type CoachingNote = {
  student: CoachingNoteUser;
  champion: CoachingNoteUser;
  text: string;
  created_at: string;
};

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/coaching-notes needs the caller's own session JWT — see docs/api/coaching-notes.md in ailene-lms-backend.
export async function getCoachingNotes(
  projectId: string,
  role: "student" | "champion"
): Promise<CoachingNote[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<CoachingNote[]>("/api/v1/coaching-notes", {
    method: "POST",
    body: { project_id: projectId, role },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getCoachingNotes",
      result.code,
      result.status,
      result.message
    );
    return [];
  }
  return result.data ?? [];
}
