"use server";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { STATUS_NO_CONTENT, STATUS_NOT_FOUND } from "@/lib/status_code";
import { setSecretKey, trpc } from "@/trpc/server";
import { cookies } from "next/headers";

export async function DeleteSession() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionData) {
    return { code: STATUS_NOT_FOUND, message: "No session token found" };
  }

  setSecretKey(process.env.SECRET_KEY_PUBLIC_API!);
  const loggedOut = await trpc.auth.logout({ token: sessionData.value });

  // Match domain/name/flags used by the login repo (ailene-os) so the browser actually deletes it.
  const domain =
    process.env.DOMAIN_MODE === "local" ? "example.com" : "ailene.id";

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    domain,
    httpOnly: true,
    secure: true,
    maxAge: 0,
  });

  return { code: STATUS_NO_CONTENT, message: loggedOut.message };
}
