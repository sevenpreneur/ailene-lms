import "server-only";

import { setSessionToken, trpc } from "@/trpc/server";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Per-request memoized Ailene gating check for server components.
 *
 * Reads the session token cookie, primes the tRPC server caller, and resolves
 * the lightweight `auth.checkAilGate` payload (role + pre-assessment status).
 *
 * Wrapped in React `cache()` so nested layouts and the page they wrap share a
 * single DB round trip within one request — e.g. `student/layout` and
 * `student/(gated)/layout` both call this but only hit the database once.
 *
 * Callers decide what to do when `ailMember`/`sessionToken` is absent
 * (redirect to login vs. render a forbidden state).
 */
export const getAilGate = cache(async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return { sessionToken: undefined, ailMember: null };
  }

  setSessionToken(sessionToken);
  const ailMember = (await trpc.auth.checkAilGate()).ail_member;

  return { sessionToken, ailMember };
});
