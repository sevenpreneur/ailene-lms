import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

// ---------- Organization dashboard ----------

export type OrganizationStats = {
  member_count: number;
  group_count: number;
};

export type ExecutiveView = {
  metrics: {
    avg_level: number;
    member_count: number;
    hours_saved_total: number;
    roi_cohort_to_date: number;
    staff_active_weekly_count: number;
    staff_active_weekly_percent: number;
  };
};

export type SponsorHeadline = {
  productive_percent: number;
  productive_count: number;
  member_count: number;
  hours_saved_last_week: number;
  roi_annualized: number;
  trend: { label: string; hours: number }[];
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

export type WeeklyTrends = {
  weeks: {
    label: string;
    hours_saved: number;
    adoption_percent: number;
    highlight: boolean;
  }[];
};

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
  hours_saved_weekly: number;
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
  top_use_case: string | null;
  submission_count: number;
  hours: number;
  trend_percent: number | null;
};

export type OrganizationLeaderboard = {
  max_score: number;
  list: OrganizationLeaderboardRow[];
};

export type PreAssessmentPillar = { key: string; score: number };

export type PreAssessmentDepartment = {
  id: number;
  name: string;
  member_count: number;
  completed_count: number;
  completion_percent: number;
  pillars: PreAssessmentPillar[];
  avg: number;
};

export type PreAssessmentOrganization = {
  department_count: number;
  total_members: number;
  completed_count: number;
  measured_at: string | null;
  target: number;
  org_avg: number;
  ready_count: number;
  gap_large_count: number;
  departments: PreAssessmentDepartment[];
  org_pillars: PreAssessmentPillar[];
  readiness: { ready: number; developing: number; basic: number };
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
    hours_saved_total: number;
    accepted_use_cases: number;
    accepted_use_cases_this_month: number;
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

export type GroupTopUseCases = {
  total: number;
  use_cases: {
    id: number;
    name: string;
    level_code: string | null;
    level_name: string | null;
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
  accepted_use_cases: number;
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

export type OutcomeOverview = {
  member_count: number;
  department_count: number;
  hours_saved_total: number;
  fte_equivalent: number;
  roi_total: number;
  roi_rate_per_hour: number;
  avg_level: number;
  max_level_number: number;
  certified_count: number;
  certified_percent: number;
};

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

export type RoiTrend = {
  months: {
    label: string;
    month: string;
    roi_value: number;
    roi_billion: number;
    projected: boolean;
  }[];
};

export type DepartmentRoi = {
  total_roi_annualized: number;
  departments: {
    id: number;
    name: string;
    member_count: number;
    hours_saved_weekly: number;
    hours_saved_total: number;
    roi_annualized: number;
    contribution_percent: number;
  }[];
};

export type TopPerformer = {
  rank: number;
  access_id: string;
  full_name: string;
  avatar: string | null;
  department: string;
  level_number: number;
  level_code: string | null;
  level_name: string | null;
  xp: number;
  use_case_count: number;
  hours: number;
  composite: number;
};

export type TopPerformers = { total: number; list: TopPerformer[] };

// ---------- Calls ----------

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// Every /api/v1/sponsor/* endpoint: session JWT + project_id, sponsor-only — see docs/api/sponsor.md.
async function sponsorCall<T>(
  name: string,
  path: string,
  body: Record<string, unknown>
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

export function getOrganizationStats(projectId: string) {
  return sponsorCall<OrganizationStats>(
    "getOrganizationStats",
    "/api/v1/sponsor/organization-stats",
    { project_id: projectId }
  );
}

export function getExecutiveView(projectId: string) {
  return sponsorCall<ExecutiveView>(
    "getExecutiveView",
    "/api/v1/sponsor/executive-view",
    { project_id: projectId }
  );
}

export function getSponsorHeadline(projectId: string) {
  return sponsorCall<SponsorHeadline>(
    "getSponsorHeadline",
    "/api/v1/sponsor/headline",
    { project_id: projectId }
  );
}

export function getProgramHealth(projectId: string) {
  return sponsorCall<ProgramHealth>(
    "getProgramHealth",
    "/api/v1/sponsor/program-health",
    { project_id: projectId }
  );
}

export function getSponsorRecentActivity(projectId: string) {
  return sponsorCall<SponsorRecentActivity>(
    "getSponsorRecentActivity",
    "/api/v1/sponsor/recent-activity",
    { project_id: projectId }
  );
}

export function getWeeklyTrends(projectId: string) {
  return sponsorCall<WeeklyTrends>(
    "getWeeklyTrends",
    "/api/v1/sponsor/weekly-trends",
    { project_id: projectId }
  );
}

export function getProficiencyTrends(projectId: string) {
  return sponsorCall<ProficiencyTrends>(
    "getProficiencyTrends",
    "/api/v1/sponsor/proficiency-trends",
    { project_id: projectId }
  );
}

export function getLevelDistribution(projectId: string) {
  return sponsorCall<LevelDistribution>(
    "getLevelDistribution",
    "/api/v1/sponsor/level-distribution",
    { project_id: projectId }
  );
}

export function getWorkforceMembers(projectId: string) {
  return sponsorCall<WorkforceMembers>(
    "getWorkforceMembers",
    "/api/v1/sponsor/workforce-members",
    { project_id: projectId }
  );
}

export function getOrganizationLeaderboard(projectId: string) {
  return sponsorCall<OrganizationLeaderboard>(
    "getOrganizationLeaderboard",
    "/api/v1/sponsor/organization-leaderboard",
    { project_id: projectId }
  );
}

export function getPreAssessmentOrganization(projectId: string) {
  return sponsorCall<PreAssessmentOrganization>(
    "getPreAssessmentOrganization",
    "/api/v1/sponsor/pre-assessment-organization",
    { project_id: projectId }
  );
}

export function getGroupDepartments(projectId: string) {
  return sponsorCall<GroupDepartments>(
    "getGroupDepartments",
    "/api/v1/sponsor/groups/departments",
    { project_id: projectId }
  );
}

export function getGroupOverview(projectId: string, groupId: number) {
  return sponsorCall<GroupOverview>(
    "getGroupOverview",
    "/api/v1/sponsor/groups/overview",
    { project_id: projectId, group_id: groupId }
  );
}

export function getGroupLevelDistribution(projectId: string, groupId: number) {
  return sponsorCall<GroupLevelDistribution>(
    "getGroupLevelDistribution",
    "/api/v1/sponsor/groups/level-distribution",
    { project_id: projectId, group_id: groupId }
  );
}

export function getGroupTopUseCases(projectId: string, groupId: number) {
  return sponsorCall<GroupTopUseCases>(
    "getGroupTopUseCases",
    "/api/v1/sponsor/groups/top-use-cases",
    { project_id: projectId, group_id: groupId }
  );
}

export function getGroupAttentionMembers(projectId: string, groupId: number) {
  return sponsorCall<GroupAttentionMembers>(
    "getGroupAttentionMembers",
    "/api/v1/sponsor/groups/attention-members",
    { project_id: projectId, group_id: groupId }
  );
}

export function getOutcomeOverview(projectId: string) {
  return sponsorCall<OutcomeOverview>(
    "getOutcomeOverview",
    "/api/v1/sponsor/outcome/overview",
    { project_id: projectId }
  );
}

export function getOutcomeLevelDistribution(projectId: string) {
  return sponsorCall<OutcomeLevelDistribution>(
    "getOutcomeLevelDistribution",
    "/api/v1/sponsor/outcome/level-distribution",
    { project_id: projectId }
  );
}

export function getRoiTrend(projectId: string) {
  return sponsorCall<RoiTrend>("getRoiTrend", "/api/v1/sponsor/outcome/roi-trend", {
    project_id: projectId,
  });
}

export function getDepartmentRoi(projectId: string) {
  return sponsorCall<DepartmentRoi>(
    "getDepartmentRoi",
    "/api/v1/sponsor/outcome/department-roi",
    { project_id: projectId }
  );
}

export function getTopPerformers(projectId: string) {
  return sponsorCall<TopPerformers>(
    "getTopPerformers",
    "/api/v1/sponsor/outcome/top-performers",
    { project_id: projectId }
  );
}
