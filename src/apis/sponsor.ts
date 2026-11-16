import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";
import type {
  PreAssessmentBand,
  PreAssessmentBaselineBandCount,
  PreAssessmentBaselineCluster,
} from "./pre-assessment";

// ---------- Organization dashboard ----------

export type OrganizationStats = {
  member_count: number;
  group_count: number;
};

export type ExecutiveView = {
  metrics: {
    avg_level: number;
    member_count: number;
    staff_active_weekly_count: number;
    staff_active_weekly_percent: number;
  };
};

export type ProgramHealthMetric = {
  key: string;
  label: string;
  name: string;
  percent: number;
  detail: string;
};

export type ProgramHealth = { metrics: ProgramHealthMetric[] };

export type SponsorActivityType =
  | "submission"
  | "accepted"
  | "review"
  | "assessment";

export type SponsorActivityEntry = {
  type: SponsorActivityType;
  actor: string;
  action: string;
  meta: string | null;
  time: string;
  at: string;
};

export type SponsorRecentActivity = { activity: SponsorActivityEntry[] };

export type ProficiencyTrends = {
  weeks: {
    label: string;
    avg_level: number;
    avg_xp: number;
    highlight: boolean;
  }[];
};

export type LevelDistributionLevel = {
  id: number;
  code: string;
  label: string;
  name: string;
  count: number;
  percent: number;
};

export type LevelDistributionGroup = {
  id: number;
  name: string;
  total: number;
  active_weekly: number;
  entry_level_count: number;
  entry_level_percent: number;
  levels: {
    level_id: number;
    code: string;
    label: string;
    name: string;
    count: number;
    percent: number;
  }[];
};

export type LevelDistribution = {
  total: number;
  active_weekly: number;
  participation_percent: number;
  levels: LevelDistributionLevel[];
  groups: LevelDistributionGroup[];
  groups_needing_intervention: LevelDistributionGroup[];
};

export type WorkforceMember = {
  access_id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar: string | null;
  };
  department: { id: number; name: string } | null;
  job_title: string | null;
  current_level: { id: number; level_number: number; name: string } | null;
  score: number;
  progress_percent: number;
  segment: "Promotor" | "Netral" | "Resistor";
  status: {
    kind: "champion" | "up" | "pass" | "idle" | "stable";
    label: string;
  };
};

export type WorkforceMembers = {
  total: number;
  departments: { id: number; name: string }[];
  list: WorkforceMember[];
};

export type OrganizationLeaderboardRow = {
  rank: number;
  id: number;
  name: string;
  member_count: number;
  avg_score: number;
  submission_count: number;
  trend_percent: number | null;
};

export type OrganizationLeaderboard = {
  max_score: number;
  list: OrganizationLeaderboardRow[];
};

export type PreAssessmentDepartment = {
  id: number;
  name: string;
  member_count: number;
  submitted_count: number;
  scored_count: number;
  completion_percent: number;
  meets_target_count: number;
  avg: number | null;
  clusters: PreAssessmentBaselineCluster[];
  bands: PreAssessmentBaselineBandCount[];
};

export type PreAssessmentOrganization = {
  department_count: number;
  total_members: number;
  submitted_count: number;
  scored_count: number;
  measured_at: string | null;
  target_band: PreAssessmentBand;
  meets_target_count: number;
  org_avg: number | null;
  org_clusters: PreAssessmentBaselineCluster[];
  bands: PreAssessmentBaselineBandCount[];
  departments: PreAssessmentDepartment[];
};

// ---------- Department detail ----------

export type GroupDepartments = {
  departments: { id: number; name: string; member_count: number }[];
};

export type GroupOverview = {
  group: {
    id: number;
    name: string;
    champion: {
      access_id: string;
      full_name: string;
      avatar: string | null;
      job_title: string | null;
    } | null;
  };
  metrics: {
    total_members: number;
    active_members: number;
    active_percent: number;
    avg_level: number;
    beginner_count: number;
    beginner_percent: number;
    needs_intervention: boolean;
  };
};

export type GroupLevelDistribution = {
  total_members: number;
  levels: {
    id: number;
    level_number: number;
    code: string;
    name: string;
    count: number;
    percent: number;
  }[];
};

export type GroupAttentionMember = {
  access_id: string;
  full_name: string;
  avatar: string | null;
  job_title: string | null;
  level_number: number;
  level_name: string | null;
  inactive_days: number | null;
  status: string;
  needs_attention: boolean;
  score: number;
};

export type GroupAttentionMembers = {
  lagging_count: number;
  members: GroupAttentionMember[];
};

// ---------- Outcome report ----------

export type OutcomeLevelDistribution = {
  total: number;
  distribution: {
    level_number: number;
    code: string;
    name: string;
    count: number;
    percent: number;
  }[];
};

// ---------- Calls ----------

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// Every /api/v1/sponsor/* endpoint: session JWT + project_id, sponsor-only — see docs/api/sponsor.md.
async function sponsorCall<T>(
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
    throw new Error("Data belum dapat dimuat.");
  }
  return result.data ?? null;
}

export function getOrganizationStats(projectId: string) {
  return sponsorCall<OrganizationStats>(
    "getOrganizationStats",
    "/api/v1/sponsor/organization-stats",
    { project_id: projectId },
  );
}

export function getExecutiveView(projectId: string) {
  return sponsorCall<ExecutiveView>(
    "getExecutiveView",
    "/api/v1/sponsor/executive-view",
    { project_id: projectId },
  );
}

export function getProgramHealth(projectId: string) {
  return sponsorCall<ProgramHealth>(
    "getProgramHealth",
    "/api/v1/sponsor/program-health",
    { project_id: projectId },
  );
}

export function getSponsorRecentActivity(projectId: string) {
  return sponsorCall<SponsorRecentActivity>(
    "getSponsorRecentActivity",
    "/api/v1/sponsor/recent-activity",
    { project_id: projectId },
  );
}

export function getProficiencyTrends(projectId: string) {
  return sponsorCall<ProficiencyTrends>(
    "getProficiencyTrends",
    "/api/v1/sponsor/proficiency-trends",
    { project_id: projectId },
  );
}

export function getLevelDistribution(projectId: string) {
  return sponsorCall<LevelDistribution>(
    "getLevelDistribution",
    "/api/v1/sponsor/level-distribution",
    { project_id: projectId },
  );
}

export function getWorkforceMembers(projectId: string) {
  return sponsorCall<WorkforceMembers>(
    "getWorkforceMembers",
    "/api/v1/sponsor/workforce-members",
    { project_id: projectId },
  );
}

export function getOrganizationLeaderboard(projectId: string) {
  return sponsorCall<OrganizationLeaderboard>(
    "getOrganizationLeaderboard",
    "/api/v1/sponsor/organization-leaderboard",
    { project_id: projectId },
  );
}

export function getPreAssessmentOrganization(projectId: string) {
  return sponsorCall<PreAssessmentOrganization>(
    "getPreAssessmentOrganization",
    "/api/v1/sponsor/pre-assessment-organization",
    { project_id: projectId },
  );
}

export function getGroupDepartments(projectId: string) {
  return sponsorCall<GroupDepartments>(
    "getGroupDepartments",
    "/api/v1/sponsor/groups/departments",
    { project_id: projectId },
  );
}

export function getGroupOverview(projectId: string, groupId: number) {
  return sponsorCall<GroupOverview>(
    "getGroupOverview",
    "/api/v1/sponsor/groups/overview",
    { project_id: projectId, group_id: groupId },
  );
}

export function getGroupLevelDistribution(projectId: string, groupId: number) {
  return sponsorCall<GroupLevelDistribution>(
    "getGroupLevelDistribution",
    "/api/v1/sponsor/groups/level-distribution",
    { project_id: projectId, group_id: groupId },
  );
}

export function getGroupAttentionMembers(projectId: string, groupId: number) {
  return sponsorCall<GroupAttentionMembers>(
    "getGroupAttentionMembers",
    "/api/v1/sponsor/groups/attention-members",
    { project_id: projectId, group_id: groupId },
  );
}

export function getOutcomeLevelDistribution(projectId: string) {
  return sponsorCall<OutcomeLevelDistribution>(
    "getOutcomeLevelDistribution",
    "/api/v1/sponsor/outcome/level-distribution",
    { project_id: projectId },
  );
}

