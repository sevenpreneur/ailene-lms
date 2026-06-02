"use server";

import { STATUS_NO_CONTENT, STATUS_NOT_FOUND } from "@/lib/status_code";
import { setSecretKey, trpc } from "@/trpc/server";
import { cookies } from "next/headers";

export async function DeleteSession() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("session_token");

  if (!sessionData) {
    return { code: STATUS_NOT_FOUND, message: "No session token found" };
  }

  setSecretKey(process.env.SECRET_KEY_PUBLIC_API!);
  const loggedOut = await trpc.auth.logout({ token: sessionData.value });

  let domain = "sevenpreneur.net";
  if (process.env.DOMAIN_MODE === "local") {
    domain = "example.com";
  }

  cookieStore.set("session_token", "", {
    domain,
    path: "/",
    maxAge: 0,
  });

  return { code: STATUS_NO_CONTENT, message: loggedOut.message };
}
