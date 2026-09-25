import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type LmsBackendUser = {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  job_title: string;
};

export type LmsProjectRole = "champion" | "student" | "sponsor";

export type LmsProjectAccess = {
  id: string;
  name: string;
  company_name: string | null;
  company_slug: string | null;
  avatar: string | null;
  // Always present: group_id is NOT NULL and a composite FK makes the backend's LEFT JOIN always match.
  group_id: number;
  group_name: string;
  role: LmsProjectRole;
  has_pre_assessment: boolean;
};

export type LmsSession = {
  user: LmsBackendUser;
  project_access: LmsProjectAccess[];
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

type LoginResult =
  | { success: true; user: LmsBackendUser }
  | { success: false; code: number; message: string };

// Both login endpoints are gated by a static shared bearer, not per-user auth — see docs/api/auth.md in ailene-lms-api.
async function loginWith(
  path: string,
  body: Record<string, unknown>,
): Promise<LoginResult> {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("CLIENT_SECRET is not configured");
  }

  const result = await callApi<{ token: string; user: LmsBackendUser }>(path, {
    method: "POST",
    body,
    token: clientSecret,
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      code: result.code || 500,
      message: result.message || "Login failed",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, result.data.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return { success: true, user: result.data.user };
}

export function loginWithGoogleAccessToken(accessToken: string) {
  return loginWith("/api/v1/auth/login/google", { access_token: accessToken });
}

export function loginWithPassword(email: string, password: string) {
  return loginWith("/api/v1/auth/login/password", { email, password });
}

export const checkSession = cache(async (): Promise<LmsSession | null> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const result = await callApi<LmsSession>("/api/v1/auth/check-session", {
    method: "POST",
    token: sessionToken,
  });

  return result.success && result.data ? result.data : null;
});

// Tenant identity is per-project, never deployment config; checkSession() is cached so this adds no call.
export async function getProjectAccess(
  projectId: string,
): Promise<LmsProjectAccess | null> {
  const session = await checkSession();
  return (
    session?.project_access.find((project) => project.id === projectId) ?? null
  );
}

export async function logoutSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    try {
      await callApi("/api/v1/auth/logout", {
        method: "POST",
        token: sessionToken,
      });
    } catch {
      // Clear the cookie below regardless of whether the backend call succeeded.
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
