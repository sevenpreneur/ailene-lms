import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type ChampionLevel = {
  id: number;
  level_number: number;
  name: string;
};

export type ChampionCategory = { id: number; name: string };

export type TeamMemberStatus = "on_track" | "at_risk" | "behind";

export type TeamMember = {
  access_id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar: string | null;
  };
  current_level: ChampionLevel | null;
  total_xp: number;
  progress_percent: number;
  use_case_count: number;
  last_active_at: string | null;
  status: TeamMemberStatus;
};

export type TeamMembers = {
  stats: {
    total: number;
    on_track: number;
    at_risk: number;
    behind: number;
    active_this_week: number;
    submissions_sent: number;
    members_submitted: number;
    hours_saved: number;
  };
  list: TeamMember[];
};

export type MemberDetailsActivity = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  occurred_at: string;
};

export type MemberDetails = {
  member: {
    access_id: string;
    full_name: string;
    email: string;
    avatar: string | null;
    job_title: string | null;
    group: { id: number; name: string } | null;
    current_level: ChampionLevel | null;
    joined_at: string | null;
    last_active_at: string | null;
  };
  metrics: {
    gate_percent: number;
    streak_days: number;
    submission_total: number;
    avg_quiz: number;
  };
  radar: {
    total_submissions: number;
    dimensions: { key: string; label: string; score: number }[];
  };
  gate: {
    from_level: number | null;
    to_level: number | null;
    next_level_id: number | null;
    done: number;
    total: number;
    percent: number;
    ready: boolean;
    requirements: { label: string; completed: boolean }[];
  };
  activities: MemberDetailsActivity[];
  notes: {
    id: number;
    text: string;
    created_at: string;
    champion_name: string | null;
  }[];
};

export type ChampionPillar = { key: string; score: number };

export type PreAssessmentTeamMember = {
  access_id: string;
  name: string;
  avatar: string | null;
  avg: number;
  pillars: ChampionPillar[];
  weakest_key: string | null;
};

export type PreAssessmentTeam = {
  department_count: number;
  total_members: number;
  completed_count: number;
  measured_at: string | null;
  target: number;
  team_avg: number;
  ready_count: number;
  gap_large_count: number;
  departments: {
    id: number;
    name: string;
    member_count: number;
    completed_count: number;
    completion_percent: number;
    avg: number;
    pillars: ChampionPillar[];
    members: PreAssessmentTeamMember[];
  }[];
  team_pillars: ChampionPillar[];
  readiness: { ready: number; developing: number; basic: number };
};

export type ChampionReportPeriod = "weekly" | "monthly";

export type ChampionReport = {
  period: ChampionReportPeriod;
  generated_at: string;
  report: {
    title: string;
    team_name: string | null;
    champion_name: string | null;
    status: string;
  };
  recipient: {
    access_id: string;
    full_name: string;
    avatar: string | null;
    job_title: string | null;
  } | null;
  metrics: {
    active_members: number;
    total_members: number;
    active_percent: number;
    accepted_submissions: number;
    hours_saved: number;
    level_ups: number;
  };
  level_movements: {
    from: string;
    to: string;
    count: number;
    note: string | null;
  }[];
  narrative: string;
  sent_reports: {
    id: string;
    title: string;
    sent_at: string;
    recipient: string | null;
  }[];
  previous_period_start: string | null;
};

// Prompt and use case queues share one row shape; hours_with_ai / ai_tool stay null for prompts.
export type ChampionSubmissionRow = {
  id: number;
  subject: {
    id: number;
    name: string;
    text: string | null;
    level: ChampionLevel | null;
  };
  member: {
    access_id: string;
    full_name: string;
    avatar: string | null;
  };
  deadline: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean;
  hours_with_ai: number | null;
  ai_tool: string | null;
  categories: ChampionCategory[];
};

export type ChampionSubmissions = { list: ChampionSubmissionRow[] };

export type ChampionReviewerRef = {
  access_id: string;
  full_name: string;
  avatar: string | null;
};

export type PromptSubmissionDetails = {
  id: number;
  prompt: {
    id: number;
    name: string;
    scenario: string | null;
    expected_output: string | null;
    level: ChampionLevel | null;
  };
  member: {
    access_id: string;
    full_name: string;
    email: string;
    avatar: string | null;
  };
  reviewed_by: ChampionReviewerRef | null;
  deadline: string | null;
  message: string | null;
  input: string | null;
  output: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  comment: string | null;
  is_accepted: boolean;
  rubric_specificity: number | null;
  rubric_context: number | null;
  rubric_constraints: number | null;
  rubric_examples: number | null;
  rubric_iteration: number | null;
  categories: ChampionCategory[];
};

export type UseCaseSubmissionDetails = {
  id: number;
  use_case: {
    id: number;
    name: string;
    description: string | null;
    level: ChampionLevel | null;
  };
  member: {
    access_id: string;
    full_name: string;
    email: string;
    avatar: string | null;
  };
  reviewed_by: ChampionReviewerRef | null;
  deadline: string | null;
  message: string | null;
  outcome_proof: string | null;
  hours_with_ai: number | null;
  hours_without_ai: number | null;
  description: string | null;
  ai_tool: string | null;
  frequency: string | null;
  type: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  comment: string | null;
  is_accepted: boolean;
  categories: ChampionCategory[];
};

export type AssignmentTarget = {
  target_type: "MEMBER" | "GROUP";
  target_access_ids?: string[];
  target_group_ids?: number[];
  deadline: string;
  message?: string | null;
};

export type AssignResult = {
  assigned_count: number;
  target_total: number;
  skipped: number;
};

export type CreatePromptAssignmentResult = AssignResult & { prompt_id: number };
export type CreateUseCaseAssignmentResult = AssignResult & {
  use_case_id: number;
};

export type ReviewResult = { xp_awarded: number };

export type AssignmentDraftKind = "PROMPT" | "USE_CASE";

// Private to the champion; becomes a library item only through create-assignment.
export type AssignmentDraft = {
  id: number;
  kind: AssignmentDraftKind;
  angle: string | null;
  name: string;
  description: string;
  expected_output: string | null;
  category_ids: number[];
  used_at: string | null;
  used_prompt_id: number | null;
  used_use_case_id: number | null;
};

// One generate call; every variant in it shares batch_id.
export type AssignmentDraftBatch = {
  batch_id: string;
  instruction: string;
  requested_kind: AssignmentDraftKind | null;
  created_at: string;
  drafts: AssignmentDraft[];
};

export type ChampionMutationResult<T> =
  | { success: true; data: T }
  | { success: false; code: number; message: string };

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// Every /api/v1/champion/* endpoint: session JWT + project_id, champion-only — see docs/api/champion.md.
async function championRead<T>(
  name: string,
  path: string,
  body: Record<string, unknown>,
): Promise<T | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<T>(path, {
    method: "POST",
    body,
    token: sessionToken,
  });

  if (!result.success) {
    await LogError(name, result.code, result.status, result.message);
    return null;
  }
  return result.data ?? null;
}

// Mutations keep the backend's code and message so route handlers can pass them through.
async function championWrite<T>(
  name: string,
  path: string,
  body: Record<string, unknown>,
): Promise<ChampionMutationResult<T>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { success: false, code: 401, message: "Not authenticated" };
  }

  const result = await callApi<T>(path, {
    method: "POST",
    body,
    token: sessionToken,
  });

  if (!result.success || !result.data) {
    await LogError(name, result.code, result.status, result.message);
    return { success: false, code: result.code, message: result.message };
  }
  return { success: true, data: result.data };
}

export function getTeamMembers(projectId: string) {
  return championRead<TeamMembers>(
    "getTeamMembers",
    "/api/v1/champion/members",
    { project_id: projectId },
  );
}

export function getMemberDetails(projectId: string, memberAccessId: string) {
  return championRead<MemberDetails>(
    "getMemberDetails",
    "/api/v1/champion/member-details",
    { project_id: projectId, member_access_id: memberAccessId },
  );
}

export function getPreAssessmentTeam(projectId: string) {
  return championRead<PreAssessmentTeam>(
    "getPreAssessmentTeam",
    "/api/v1/champion/pre-assessment-team",
    { project_id: projectId },
  );
}

export function getChampionReport(
  projectId: string,
  period: ChampionReportPeriod = "weekly",
) {
  return championRead<ChampionReport>(
    "getChampionReport",
    "/api/v1/champion/report",
    { project_id: projectId, period },
  );
}

export function getPromptSubmissions(projectId: string) {
  return championRead<ChampionSubmissions>(
    "getPromptSubmissions",
    "/api/v1/champion/prompts/submissions",
    { project_id: projectId },
  );
}

export function getPromptSubmissionDetails(
  projectId: string,
  submissionId: number,
) {
  return championRead<PromptSubmissionDetails>(
    "getPromptSubmissionDetails",
    "/api/v1/champion/prompts/submission-details",
    { project_id: projectId, submission_id: submissionId },
  );
}

export function getUseCaseSubmissions(projectId: string) {
  return championRead<ChampionSubmissions>(
    "getUseCaseSubmissions",
    "/api/v1/champion/use-cases/submissions",
    { project_id: projectId },
  );
}

export function getUseCaseSubmissionDetails(
  projectId: string,
  submissionId: number,
) {
  return championRead<UseCaseSubmissionDetails>(
    "getUseCaseSubmissionDetails",
    "/api/v1/champion/use-cases/submission-details",
    { project_id: projectId, submission_id: submissionId },
  );
}

export function assignPrompt(
  projectId: string,
  libraryId: number,
  target: AssignmentTarget,
) {
  return championWrite<AssignResult>(
    "assignPrompt",
    "/api/v1/champion/prompts/assign",
    { project_id: projectId, library_id: libraryId, ...target },
  );
}

export function assignUseCase(
  projectId: string,
  libraryId: number,
  target: AssignmentTarget,
) {
  return championWrite<AssignResult>(
    "assignUseCase",
    "/api/v1/champion/use-cases/assign",
    { project_id: projectId, library_id: libraryId, ...target },
  );
}

export function createPromptAssignment(
  projectId: string,
  input: {
    name: string;
    description: string;
    expected_output: string;
    category_ids: number[];
    assignment?: AssignmentTarget | null;
    draft_id?: number | null;
  },
) {
  return championWrite<CreatePromptAssignmentResult>(
    "createPromptAssignment",
    "/api/v1/champion/prompts/create-assignment",
    { project_id: projectId, ...input },
  );
}

export function createUseCaseAssignment(
  projectId: string,
  input: {
    name: string;
    description: string;
    category_ids: number[];
    assignment?: AssignmentTarget | null;
    draft_id?: number | null;
  },
) {
  return championWrite<CreateUseCaseAssignmentResult>(
    "createUseCaseAssignment",
    "/api/v1/champion/use-cases/create-assignment",
    { project_id: projectId, ...input },
  );
}

export function generateAssignmentDrafts(
  projectId: string,
  input: { instruction: string },
) {
  return championWrite<AssignmentDraftBatch>(
    "generateAssignmentDrafts",
    "/api/v1/champion/assignments/generate",
    { project_id: projectId, ...input },
  );
}

export function getAssignmentDrafts(projectId: string) {
  return championRead<{ batches: AssignmentDraftBatch[] }>(
    "getAssignmentDrafts",
    "/api/v1/champion/assignments/drafts",
    { project_id: projectId },
  );
}

export function deleteAssignmentDraft(projectId: string, draftId: number) {
  return championWrite<{ deleted: boolean }>(
    "deleteAssignmentDraft",
    "/api/v1/champion/assignments/drafts/delete",
    { project_id: projectId, draft_id: draftId },
  );
}

export function reviewPrompt(
  projectId: string,
  input: {
    submission_id: number;
    is_accepted: boolean;
    comment?: string | null;
    rubric_specificity?: number | null;
    rubric_context?: number | null;
    rubric_constraints?: number | null;
    rubric_examples?: number | null;
    rubric_iteration?: number | null;
  },
) {
  return championWrite<ReviewResult>(
    "reviewPrompt",
    "/api/v1/champion/prompts/review",
    { project_id: projectId, ...input },
  );
}

export function reviewUseCase(
  projectId: string,
  input: {
    submission_id: number;
    is_accepted: boolean;
    comment?: string | null;
  },
) {
  return championWrite<ReviewResult>(
    "reviewUseCase",
    "/api/v1/champion/use-cases/review",
    { project_id: projectId, ...input },
  );
}
