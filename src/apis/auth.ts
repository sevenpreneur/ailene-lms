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
  group_id: number | null;
  group_name: string | null;
  role: LmsProjectRole;
  has_pre_assessment: boolean;
};

export type LmsSession = {
  user: LmsBackendUser;
  project_access: LmsProjectAccess[];
};

type LmsSessionPayload = LmsSession & { token: string };

export type ForgetPasswordResult = { expires_in_minutes: number };

const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

type LoginResult =
  | { success: true; user: LmsBackendUser }
  | { success: false; code: number; message: string };

// Login and recovery use the shared credential, never a user's session JWT.
function clientAuthCall<T>(path: string, body: Record<string, unknown>) {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("CLIENT_SECRET is not configured");
  }

  return callApi<T>(path, {
    method: "POST",
    body,
    token: clientSecret,
    backend: "lms",
  });
}

async function loginWith(
  path: string,
  body: Record<string, unknown>,
): Promise<LoginResult> {
  const result = await clientAuthCall<LmsSessionPayload>(path, body);

  if (!result.success || !result.data?.token || !result.data.user) {
    return {
      success: false,
      code: result.success ? 502 : result.code || 500,
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
  return loginWith("/api/v2/auth/login/google", { access_token: accessToken });
}

export function loginWithPassword(email: string, password: string) {
  return loginWith("/api/v2/auth/login/password", { email, password });
}

export function requestPasswordReset(email: string) {
  return clientAuthCall<ForgetPasswordResult>("/api/v2/auth/forget-password", {
    email,
  });
}

// Checking never consumes the link; the backend checks it again when saving.
export function checkPasswordResetSession(sessionId: string) {
  return clientAuthCall<null>("/api/v2/auth/reset-password/check", {
    session_id: sessionId,
  });
}

export async function resetPassword(sessionId: string, password: string) {
  const result = await clientAuthCall<null>("/api/v2/auth/reset-password", {
    session_id: sessionId,
    password,
  });
  if (result.success) (await cookies()).delete(SESSION_COOKIE_NAME);
  return result;
}

export const checkSession = cache(async (): Promise<LmsSession | null> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const result = await callApi<LmsSessionPayload>(
    "/api/v2/auth/check-session",
    {
      method: "POST",
      token: sessionToken,
      backend: "lms",
    },
  );

  if (!result.success && result.code !== 401 && result.code !== 403) {
    throw new Error("Layanan masuk belum dapat dihubungi. Coba lagi.");
  }
  if (!result.success) return null;
  if (!result.data?.user || !Array.isArray(result.data.project_access)) {
    throw new Error("Data sesi belum dapat dimuat. Coba lagi.");
  }
  // SessionResult echoes the JWT; never serialize it into Client Component props.
  return { user: result.data.user, project_access: result.data.project_access };
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
      await callApi("/api/v2/auth/logout", {
        method: "POST",
        token: sessionToken,
        backend: "lms",
      });
    } catch {
      // Clear the cookie below regardless of whether the backend call succeeded.
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
