"use server";

import { STATUS_NO_CONTENT } from "@/lib/status_code";
import {
  checkSession as checkSessionApi,
  logoutSession as logoutSessionApi,
} from "@/apis/auth";
import { revalidatePath } from "next/cache";

export async function RefreshSkillPractice(projectId: string) {
  const session = await checkSessionApi();
  const access = session?.project_access.find(
    (project) => project.id === projectId,
  );
  if (!access || (access.role !== "student" && access.role !== "champion")) {
    throw new Error("Akses program tidak valid");
  }
  revalidatePath(`/lms/${access.id}/student/skill-practice`);
}

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
