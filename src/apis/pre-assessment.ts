import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

// Shapes follow ailene-lms-api docs/api/pre-assessment.md (the CFTE AIPF item bank).
export type PreAssessmentSection =
  | "profile"
  | "scenario"
  | "practice"
  | "behaviour";

export type PreAssessmentItemType = "single_choice" | "text";

export type PreAssessmentAttemptStatus = "submitted" | "scored";

export type PreAssessmentOption = { id: number; text: string };

export type PreAssessmentItem = {
  id: number;
  item_code: string;
  section: PreAssessmentSection;
  type: PreAssessmentItemType;
  question: string;
  options: PreAssessmentOption[];
};

export type PreAssessmentQuestions = {
  // The item-bank version assigned to the caller's project.
  version: {
    id: number;
    code: string;
    version: number;
    name: string;
    duration_minutes: number;
  };
  attempt: {
    id: number;
    status: PreAssessmentAttemptStatus;
    submitted_at: string;
  } | null;
  items: PreAssessmentItem[];
};

export type PreAssessmentAnswer =
  | { item_id: number; option_id: number }
  | { item_id: number; text: string };

export type PreAssessmentBand = { band: number; name: string; level: number };

// Shared by the champion and sponsor baselines; a cluster nobody has a score in is null.
export type PreAssessmentBaselineCluster = {
  code: string;
  name: string;
  score: number | null;
};

export type PreAssessmentBaselineBandCount = PreAssessmentBand & {
  count: number;
};

export type PreAssessmentScore = {
  attempt_id: number;
  status: PreAssessmentAttemptStatus;
  submitted_at: string;
  scored_at: string | null;
  band: PreAssessmentBand;
  raw_band: PreAssessmentBand;
  target_band: PreAssessmentBand;
  gap: number;
  meets_target: boolean;
  dimensions: { knowledge: number; skills: number; behaviours: number };
  level_mastery: { p1: number; p2: number; p3: number };
  gates: { security_passed: boolean; behaviour_passed: boolean };
  flags: { overclaim: boolean; shadow_ai: boolean; sensitive_data: boolean };
  clusters: { code: string; name: string; score: number }[];
  domains: { code: string; name: string; cluster_code: string; score: number }[];
  feedback: { item_code: string; text: string }[];
};

export type PreAssessmentResult<T> =
  | { success: true; data: T }
  | { success: false; code: number; message: string };

export async function getPreAssessmentQuestions(
  projectId: string,
): Promise<PreAssessmentResult<PreAssessmentQuestions>> {
  return preAssessmentCall<PreAssessmentQuestions>(
    "getPreAssessmentQuestions",
    "/api/v1/pre-assessment/questions",
    { project_id: projectId },
    "Gagal memuat pertanyaan pre-assessment.",
  );
}

// One-shot: a repeat call is rejected with 400, and the backend's message says why. The version comes from the project.
export async function submitPreAssessment(
  projectId: string,
  answers: PreAssessmentAnswer[],
): Promise<PreAssessmentResult<{ attempt_id: number; status: string }>> {
  return preAssessmentCall(
    "submitPreAssessment",
    "/api/v1/pre-assessment/submit",
    { project_id: projectId, answers },
    "Gagal mengirim pre-assessment.",
  );
}

// The first call after submit grades the written answers with DeepSeek, so it can take a few seconds or 502.
export async function getPreAssessmentScore(
  projectId: string,
): Promise<PreAssessmentResult<PreAssessmentScore | null>> {
  return preAssessmentCall<PreAssessmentScore | null>(
    "getPreAssessmentScore",
    "/api/v1/pre-assessment/score",
    { project_id: projectId },
    "Gagal menghitung hasil pre-assessment.",
  );
}

async function preAssessmentCall<T>(
  name: string,
  path: string,
  body: unknown,
  fallbackMessage: string,
): Promise<PreAssessmentResult<T>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { success: false, code: 401, message: "Sesi kamu sudah berakhir." };
  }

  const result = await callApi<T>(path, {
    method: "POST",
    body,
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(name, result.code, result.status, result.message);
    return {
      success: false,
      code: result.code || 500,
      message: result.message || fallbackMessage,
    };
  }
  return { success: true, data: (result.data ?? null) as T };
}
