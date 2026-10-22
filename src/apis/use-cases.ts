import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type UseCaseCategory = { id: number; name: string };

export type UseCaseLibraryItem = {
  id: number;
  name: string;
  description: string;
  level_number: number;
  categories: UseCaseCategory[];
  deadline_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean | null;
};

export type Metapaging = {
  total_data: number;
  total_page: number;
  current_page: number;
  page_size: number;
};

export type AssignedUseCase = {
  id: number;
  name: string;
  description: string;
  level_id: number;
  level_number: number;
  categories: UseCaseCategory[];
  xp_reward: number;
  is_accepted: boolean;
  deadline_at: string | null;
  reviewed_at: string | null;
  submitted_at: string | null;
  assigned_by: { id: string; name: string; avatar: string | null };
};

export type UseCaseDetail = {
  id: number;
  name: string;
  description: string;
  level_id: number;
  level_number: number;
  categories: UseCaseCategory[];
  xp_reward: number;
  is_self_created: boolean;
  deadline_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean | null;
};

export type UseCaseDetailResult =
  | { kind: "ok"; data: UseCaseDetail }
  | { kind: "not_found" };

export type UseCaseFrequency = "daily" | "weekly" | "monthly" | "occasionally";
export type UseCaseType =
  | "workflow_automation"
  | "content_creation"
  | "data_analysis"
  | "research"
  | "communication"
  | "decision_support"
  | "learning"
  | "other";

export type GuidedStatus =
  | "intake"
  | "steps_ready"
  | "in_progress"
  | "ready_to_submit"
  | "submitted";

export type GuidedStep = {
  id: number;
  order: number;
  title: string;
  instruction: string;
  suggested_tool: string;
  prompt_template: string;
  estimated_minutes: number;
  verification: string;
  is_done: boolean;
  skipped_reason: string | null;
  note: string | null;
  done_at: string | null;
};

export type GuidedSession = {
  id: number;
  use_case_id: number | null;
  project_id: string;
  status: GuidedStatus;
  current_step: number;
  daily_task: string | null;
  frequency: UseCaseFrequency | null;
  example_text: string | null;
  example_file_url: string | null;
  sensitive_data_confirmed: boolean;
  minutes_without_ai: number | null;
  current_process: string | null;
  current_tools: string[];
  pain_point: string | null;
  steps: GuidedStep[];
  summary: string | null;
  estimated_minutes_with_ai: number | null;
  risks: string[];
  regenerate_remaining: number | null;
  is_generating: boolean;
  created_at: string;
  updated_at: string;
};

export type GuidedTestimonial = {
  testimonial: string;
  helpfulness_rating: number | null;
  share_consent: boolean;
};

export type GuidedIntakeFields = Pick<
  GuidedSession,
  | "daily_task"
  | "frequency"
  | "example_text"
  | "example_file_url"
  | "sensitive_data_confirmed"
  | "minutes_without_ai"
  | "current_process"
  | "current_tools"
  | "pain_point"
>;

export type GuidedDetailsInput = {
  session_id?: number;
  project_id?: string;
  use_case_id?: number;
};

export type GuidedSaveInput = GuidedDetailsInput & {
  current_step: number;
} & Partial<GuidedIntakeFields>;

export type GuidedGenerateInput = { session_id: number; feedback?: string };
export type GuidedCheckInput = Pick<GuidedStep, "is_done"> & {
  session_id: number;
  step_id: number;
  note?: string;
  skipped_reason?: string;
};

export type GuidedSubmitInput = {
  session_id: number;
  name?: string;
  category_ids?: number[];
  outcome_proof: string;
  hours_with_ai: number;
  description: string;
  ai_tool: string;
  type: UseCaseType;
  testimonial: string;
  helpfulness_rating: number;
  share_consent: boolean;
};

export type GuidedSubmitResult = {
  session: GuidedSession;
  submission_id: number;
  use_case_id: number;
  submission_status: "awaiting_review" | "needs_revision" | "accepted";
  hours_saved: number;
};

export type GuidedResult<T> =
  | { success: true; data: T }
  | { success: false; code: number; message: string };

export type SelfCreateUseCaseInput = {
  project_id: string;
  name: string;
  category_ids: number[];
  outcome_proof: string;
  hours_with_ai: number;
  hours_without_ai: number;
  description: string;
  ai_tool: string;
  frequency: UseCaseFrequency;
  type: UseCaseType;
};

export type SubmitUseCaseInput = {
  use_case_id: number;
  outcome_proof: string;
  hours_with_ai: number;
  hours_without_ai: number;
  description: string;
  ai_tool: string;
  frequency: UseCaseFrequency;
  type: UseCaseType;
  guided_session_id?: number;
  testimonial?: string;
  helpfulness_rating?: number;
  share_consent?: boolean;
};

export type UseCaseMutationResult =
  | { success: true; data: UseCaseDetail }
  | { success: false; code: number; message: string };

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// POST /api/v1/use-cases needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function getUseCases(
  projectId: string,
  options?: { search?: string; page?: number; page_size?: number },
): Promise<{ list: UseCaseLibraryItem[]; metapaging: Metapaging | null }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], metapaging: null };

  const result = await callApi<{
    list: UseCaseLibraryItem[];
    metapaging: Metapaging;
  }>("/api/v1/use-cases", {
    method: "POST",
    body: { project_id: projectId, ...options },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError("getUseCases", result.code, result.status, result.message);
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? { list: [], metapaging: null };
}

// POST /api/v1/use-cases/assigned needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function getAssignedUseCases(
  projectId: string,
  options?: { has_submitted?: boolean; is_accepted?: boolean },
): Promise<AssignedUseCase[]> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return [];

  const result = await callApi<AssignedUseCase[]>(
    "/api/v1/use-cases/assigned",
    {
      method: "POST",
      body: { project_id: projectId, ...options },
      token: sessionToken,
    },
  );

  if (!result.success) {
    await LogError(
      "getAssignedUseCases",
      result.code,
      result.status,
      result.message,
    );
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? [];
}

// POST /api/v1/use-cases/details needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function getUseCaseDetails(
  id: number,
): Promise<UseCaseDetailResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { kind: "not_found" };

  const result = await callApi<UseCaseDetail>("/api/v1/use-cases/details", {
    method: "POST",
    body: { id },
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(
      "getUseCaseDetails",
      result.code,
      result.status,
      result.message,
    );
    if (result.code === 404) return { kind: "not_found" };
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data
    ? { kind: "ok", data: result.data }
    : { kind: "not_found" };
}

// POST /api/v1/use-cases/self-assign needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function selfAssignUseCase(
  useCaseId: number,
): Promise<UseCaseMutationResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Not authenticated" };
  }

  const result = await callApi<UseCaseDetail>("/api/v1/use-cases/self-assign", {
    method: "POST",
    body: { use_case_id: useCaseId },
    token: sessionToken,
  });

  if (!result.success || !result.data) {
    await LogError(
      "selfAssignUseCase",
      result.code,
      result.status,
      result.message,
    );
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}

// POST /api/v1/use-cases/self-create needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function selfCreateUseCase(
  input: SelfCreateUseCaseInput,
): Promise<UseCaseMutationResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Not authenticated" };
  }

  const result = await callApi<UseCaseDetail>("/api/v1/use-cases/self-create", {
    method: "POST",
    body: input,
    token: sessionToken,
  });

  if (!result.success || !result.data) {
    await LogError(
      "selfCreateUseCase",
      result.code,
      result.status,
      result.message,
    );
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}

// POST /api/v1/use-cases/submit needs the caller's own session JWT — see docs/api/use-cases.md in ailene-lms-backend.
export async function submitUseCase(
  input: SubmitUseCaseInput,
): Promise<UseCaseMutationResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Not authenticated" };
  }

  const result = await callApi<UseCaseDetail>("/api/v1/use-cases/submit", {
    method: "POST",
    body: input,
    token: sessionToken,
  });

  if (!result.success || !result.data) {
    await LogError("submitUseCase", result.code, result.status, result.message);
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}

// Every guided endpoint shares the student's JWT and envelope — see docs/api/use-cases.md in ailene-lms-backend.
async function callGuided<T>(
  name: string,
  path: string,
  body: unknown,
): Promise<GuidedResult<T>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Not authenticated" };
  }

  const result = await callApi<T>(path, {
    method: "POST",
    body,
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(name, result.code, result.status, result.message);
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data as T };
}

// data is null when the student has no open draft for this project or use case.
export function getGuidedSession(input: GuidedDetailsInput) {
  return callGuided<GuidedSession | null>(
    "getGuidedSession",
    "/api/v1/use-cases/guided/details",
    input,
  );
}

export function saveGuidedSession(input: GuidedSaveInput) {
  return callGuided<GuidedSession>(
    "saveGuidedSession",
    "/api/v1/use-cases/guided/save",
    input,
  );
}

export function generateGuidedWorkflow(input: GuidedGenerateInput) {
  return callGuided<GuidedSession>(
    "generateGuidedWorkflow",
    "/api/v1/use-cases/guided/generate",
    input,
  );
}

export function checkGuidedStep(input: GuidedCheckInput) {
  return callGuided<GuidedStep>(
    "checkGuidedStep",
    "/api/v1/use-cases/guided/check",
    input,
  );
}

export function submitGuidedUseCase(input: GuidedSubmitInput) {
  return callGuided<GuidedSubmitResult>(
    "submitGuidedUseCase",
    "/api/v1/use-cases/guided/submit",
    input,
  );
}
