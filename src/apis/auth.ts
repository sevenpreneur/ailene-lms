import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type LmsBackendUser = {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  role: "student" | "champion" | "sponsor";
  job_title: string | null;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

// POST /api/auth/login/google is gated by a static shared bearer, not per-user auth — see docs/auth.md in ailene-lms-backend.
export async function loginWithGoogleAccessToken(
  accessToken: string
): Promise<
  | { success: true; user: LmsBackendUser }
  | { success: false; code: number; message: string }
> {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("CLIENT_SECRET is not configured");
  }

  const result = await callApi<{ token: string; user: LmsBackendUser }>(
    "/api/auth/login/google",
    {
      method: "POST",
      body: { access_token: accessToken },
      token: clientSecret,
    }
  );

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
