import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

// Contract: ../ailene-lms-apis/docs/api/workflows.md

export type WorkflowFrequency = "daily" | "weekly" | "monthly" | "occasionally";
export type WorkflowStatus = "draft" | "submitted" | "reviewed";
export type WorkflowFeedbackKind = "automate" | "improve" | "question";

// One step of the map; blank text comes back as null.
export type WorkflowNode = {
  id: string;
  title: string | null;
  source: string | null;
  tool: string | null;
  minutes: number | null;
  pain_point: boolean;
};

// Request shape: text is always a string; the backend trims and stores blanks as null.
export type WorkflowNodeInput = {
  id: string;
  title: string;
  source: string;
  tool: string;
  minutes: number | null;
  pain_point: boolean;
};

// An example output the learner already uploaded to storage.
export type WorkflowAttachment = {
  node_id: string | null;
  url: string;
  name: string;
  mime_type: string;
  size_bytes: number;
};

export type WorkflowFeedback = {
  id: number;
  node_id: string | null;
  kind: WorkflowFeedbackKind;
  body: string;
  author: { access_id: string; full_name: string; avatar: string | null };
  created_at: string;
};

export type WorkflowSummary = {
  step_count: number;
  total_minutes: number;
  pain_count: number;
  feedback_count: number;
};

export type WorkflowListItem = {
  id: number;
  title: string | null;
  problem: string | null;
  frequency: WorkflowFrequency | null;
  result: string | null;
  status: WorkflowStatus;
  summary: WorkflowSummary;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Workflow = WorkflowListItem & {
  nodes: WorkflowNode[];
  attachments: WorkflowAttachment[];
  feedback: WorkflowFeedback[];
};

export type WorkflowContent = {
  title: string;
  problem: string;
  frequency: WorkflowFrequency | null;
  result: string;
  nodes: WorkflowNodeInput[];
  attachments: WorkflowAttachment[];
};

export type WorkflowMutationResult<T> =
  | { success: true; data: T }
  | { success: false; code: number; message: string };

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

async function workflowCall<T>(
  name: string,
  path: string,
  body: Record<string, unknown>,
): Promise<WorkflowMutationResult<T>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Not authenticated" };
  }
  const result = await callApi<T>(path, {
    method: "POST",
    body,
    token: sessionToken,
    backend: "lms",
  });
  if (!result.success || !result.data) {
    await LogError(name, result.code, result.status, result.message);
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}

// Null means the list could not be loaded; an empty list is `[]`.
export async function getWorkflows(
  projectId: string,
): Promise<WorkflowListItem[] | null> {
  const result = await workflowCall<{ list: WorkflowListItem[] }>(
    "getWorkflows",
    "/api/v2/workflows",
    { project_id: projectId },
  );
  return result.success ? result.data.list : null;
}

export async function getWorkflow(
  projectId: string,
  workflowId: number,
): Promise<
  { kind: "ok"; data: Workflow } | { kind: "not_found" } | { kind: "error" }
> {
  const result = await workflowCall<Workflow>(
    "getWorkflow",
    "/api/v2/workflows/details",
    { project_id: projectId, workflow_id: workflowId },
  );
  if (result.success) return { kind: "ok", data: result.data };
  return result.code === 404 ? { kind: "not_found" } : { kind: "error" };
}

export function createWorkflow(projectId: string, content: WorkflowContent) {
  return workflowCall<Workflow>("createWorkflow", "/api/v2/workflows/create", {
    project_id: projectId,
    ...content,
  });
}

export function updateWorkflow(
  projectId: string,
  workflowId: number,
  content: WorkflowContent,
) {
  return workflowCall<Workflow>("updateWorkflow", "/api/v2/workflows/update", {
    project_id: projectId,
    workflow_id: workflowId,
    ...content,
  });
}

export function submitWorkflow(projectId: string, workflowId: number) {
  return workflowCall<Workflow>("submitWorkflow", "/api/v2/workflows/submit", {
    project_id: projectId,
    workflow_id: workflowId,
  });
}

export function deleteWorkflow(projectId: string, workflowId: number) {
  return workflowCall<{ id: number }>(
    "deleteWorkflow",
    "/api/v2/workflows/delete",
    { project_id: projectId, workflow_id: workflowId },
  );
}
