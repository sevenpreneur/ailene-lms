"use server";

import { STATUS_NO_CONTENT } from "@/lib/status_code";
import {
  checkSession as checkSessionApi,
  logoutSession as logoutSessionApi,
} from "@/apis/auth";

export async function CheckSession() {
  const user = await checkSessionApi();
  if (!user) {
    throw new Error("Session tidak valid");
  }
  return { user };
}

export async function DeleteSession() {
  await logoutSessionApi();
  return { code: STATUS_NO_CONTENT, message: "Logged out" };
}
