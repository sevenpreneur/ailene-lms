"use server";

import { STATUS_NO_CONTENT } from "@/lib/status_code";
import {
  checkSession as checkSessionApi,
  logoutSession as logoutSessionApi,
} from "@/apis/auth";

export async function CheckSession() {
  const session = await checkSessionApi();
  if (!session) {
    throw new Error("Session tidak valid");
  }
  return session;
}

export async function DeleteSession() {
  await logoutSessionApi();
  return { code: STATUS_NO_CONTENT, message: "Logged out" };
}
