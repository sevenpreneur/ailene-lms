import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

// The 19 answer fields per docs/api/pre-assessment.md; only concrete_example is optional.
export type PreAssessmentAnswers = {
  ai_use_frequency: string;
  ai_tools_used: string[];
  ai_limitations: string[];
  output_review: string;
  use_cases: string[];
  team_adoption: string;
  concrete_example?: string;
  model_selection: string;
  multimodal_use: string;
  workflow_reuse: string;
  prompt_comfort: string;
  prompt_iteration: string;
  refine_scenario: string;
  professional_attitude: string;
  data_safety_check: string;
  publish_unchecked: string;
  biggest_challenge: string;
  training_expectation: string;
  motivation: string;
};

export type CreatePreAssessmentResult =
  | { success: true; id: number }
  | { success: false; code: number; message: string };

// One-shot: a repeat call is rejected with 400, so this returns the failure message instead of null.
export async function createPreAssessment(
  projectId: string,
  answers: PreAssessmentAnswers,
): Promise<CreatePreAssessmentResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return { success: false, code: 401, message: "Sesi kamu sudah berakhir." };
  }

  const result = await callApi<{ id: number }>(
    "/api/v1/pre-assessment/create",
    {
      method: "POST",
      body: { project_id: projectId, ...answers },
      token: sessionToken,
    },
  );

  if (!result.success || !result.data) {
    await LogError(
      "createPreAssessment",
      result.code,
      result.status,
      result.message,
    );
    return {
      success: false,
      code: result.code || 500,
      message: result.message || "Gagal mengirim pre-assessment.",
    };
  }

  return { success: true, id: result.data.id };
}

export type PreAssessmentPillarRef = { key: string; label: string };

// One AI-generated use-case recommendation, rendered verbatim by PreAssessmentReportAILN.
export type PreAssessmentRecommendation = {
  source: string; // the routine/task the user described that this addresses
  title: string; // the concrete AI use case proposed
  impact: string; // "Tinggi" | "Sedang" | "Rendah"
  speed: string; // e.g. "~70% lebih cepat"
  description: string; // 1-2 sentence actionable explanation
  lessons: string[]; // referenced curriculum chapter names (verbatim)
};

// Computed by the backend; `tone` is presentation and is derived from `score` on the client.
export type PreAssessmentReportSummary = {
  pillars: { key: string; label: string; score: number }[];
  avg: number;
  strongest: PreAssessmentPillarRef;
  weakest: PreAssessmentPillarRef;
  quote: string;
};

export type PreAssessmentScore = {
  // Every column of the caller's lms_pre_assessments row; null before submit.
  pre_assessment: Record<string, unknown> | null;
  report: PreAssessmentReportSummary | null;
};

export type PreAssessmentReportStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

// Passed through unvalidated by the endpoint, so every field here is optional.
export type PreAssessmentRecommendationsBlob = {
  time_saved_label?: string;
  items?: PreAssessmentRecommendation[];
};

export type PreAssessmentRecommendationsResult = {
  status: PreAssessmentReportStatus;
  recommendations: PreAssessmentRecommendationsBlob | null;
  error_message: string | null;
  generated_at: string | null;
};

// POST /api/v1/pre-assessment/score needs the caller's own session JWT.
export async function getPreAssessmentScore(
  projectId: string,
): Promise<PreAssessmentScore | null> {
  return preAssessmentCall<PreAssessmentScore>(
    "getPreAssessmentScore",
    "/api/v1/pre-assessment/score",
    projectId,
  );
}

// Generated asynchronously, so the caller polls while status is pending/processing.
export async function getPreAssessmentRecommendations(
  projectId: string,
): Promise<PreAssessmentRecommendationsResult | null> {
  return preAssessmentCall<PreAssessmentRecommendationsResult>(
    "getPreAssessmentRecommendations",
    "/api/v1/pre-assessment/recommendations",
    projectId,
  );
}

export type RegenerateRecommendationsResult =
  | { success: true; data: PreAssessmentRecommendationsResult }
  | { success: false; code: number; message: string };

// Keeps the backend's message so the student learns why a retry was refused.
export async function regeneratePreAssessmentRecommendations(
  projectId: string,
): Promise<RegenerateRecommendationsResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return { success: false, code: 401, message: "Sesi kamu sudah berakhir." };
  }

  const result = await callApi<PreAssessmentRecommendationsResult>(
    "/api/v1/pre-assessment/recommendations/regenerate",
    { method: "POST", body: { project_id: projectId }, token: sessionToken },
  );

  if (!result.success || !result.data) {
    await LogError(
      "regeneratePreAssessmentRecommendations",
      result.code,
      result.status,
      result.message,
    );
    return {
      success: false,
      code: result.code || 502,
      message: result.message || "Gagal membuat ulang rekomendasi.",
    };
  }
  return { success: true, data: result.data };
}

// Both read endpoints take the same { project_id } body and session JWT.
async function preAssessmentCall<T>(
  name: string,
  path: string,
  projectId: string,
): Promise<T | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<T>(path, {
    method: "POST",
    body: { project_id: projectId },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(name, result.code, result.status, result.message);
    return null;
  }
  return result.data ?? null;
}
