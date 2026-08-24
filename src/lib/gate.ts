import "server-only";

import { checkSession } from "@/apis/auth";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { getHasPreAssessmentMock } from "@/mock-data/shared";
import { cookies } from "next/headers";
import { cache } from "react";

type GateRole = "CHAMPION" | "STUDENT" | "SPONSOR";

const ROLE_MAP: Record<string, GateRole> = {
  champion: "CHAMPION",
  student: "STUDENT",
  sponsor: "SPONSOR",
};

export type ProgramGateAilMember = {
  id: string;
  role: GateRole;
  has_pre_assessment: boolean;
};

/**
 * Per-request memoized program gating check for server components.
 *
 * Resolves the caller's role for `projectId` from the real
 * ailene-lms-backend session (`checkSession()`), matched against
 * `project_access`. Business-data fields (`has_pre_assessment`) come from
 * `src/mock-data/` until ailene-lms-backend has an equivalent endpoint.
 *
 * Wrapped in React `cache()` so nested layouts sharing the same `projectId`
 * within one request only resolve the session once.
 */
export const getProgramGate = cache(async (projectId: string) => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return { sessionToken: undefined, ailMember: null };
  }

  const session = await checkSession();
  if (!session) {
    return { sessionToken, ailMember: null };
  }

  const access = session.project_access.find((p) => p.project_id === projectId);
  if (!access) {
    return { sessionToken, ailMember: null };
  }

  const ailMember: ProgramGateAilMember = {
    id: session.user.id,
    role: ROLE_MAP[access.role],
    has_pre_assessment: getHasPreAssessmentMock({
      projectId,
      userId: session.user.id,
    }),
  };

  return { sessionToken, ailMember };
});
