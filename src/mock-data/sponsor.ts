// Sponsor-facing mock data — executive dashboard, workforce, ROI/outcome,
// groups (department drill-down), and pre-assessment (org-wide view).

import {
  GROUPS,
  LEVELS,
  MEMBER_ROSTER,
  PILLAR_DEFS,
  levelByNumber,
} from "./shared";
import { daysAgo, pct, ROI_VALUE_PER_HOUR, round1 } from "./utils";

const TOTAL_MEMBERS = MEMBER_ROSTER.length;
const AVG_LEVEL = round1(
  MEMBER_ROSTER.reduce((s, m) => s + m.current_level.level_number, 0) / TOTAL_MEMBERS
);
const HOURS_SAVED_TOTAL = 46;

export function getOrganizationStatsMock() {
  return { member_count: TOTAL_MEMBERS, group_count: GROUPS.length };
}

export function getExecutiveViewMock() {
  return {
    metrics: {
      avg_level: AVG_LEVEL,
      member_count: TOTAL_MEMBERS,
      hours_saved_total: HOURS_SAVED_TOTAL,
      roi_cohort_to_date: HOURS_SAVED_TOTAL * ROI_VALUE_PER_HOUR,
      staff_active_weekly_count: MEMBER_ROSTER.filter((m) => m.status !== "behind").length,
      staff_active_weekly_percent: pct(
        MEMBER_ROSTER.filter((m) => m.status !== "behind").length,
        TOTAL_MEMBERS
      ),
    },
  };
}

export function getHeadlineMock() {
  return {
    productive_percent: pct(
      MEMBER_ROSTER.filter((m) => m.current_level.level_number >= 2).length,
      TOTAL_MEMBERS
    ),
    productive_count: MEMBER_ROSTER.filter((m) => m.current_level.level_number >= 2).length,
    member_count: TOTAL_MEMBERS,
    hours_saved_last_week: 9,
    roi_annualized: HOURS_SAVED_TOTAL * 52 * ROI_VALUE_PER_HOUR,
    trend: Array.from({ length: 12 }, (_, i) => ({
      label: `M${i + 1}`,
      hours: Math.round(4 + Math.sin(i / 2) * 3 + i * 0.4),
    })),
  };
}

export function getProgramHealthMock() {
  return {
    metrics: [
      { key: "pass_l1", label: "Lulus L1", name: "Lulus Level 1", percent: 88, detail: "7 dari 8 karyawan" },
      { key: "pass_l2", label: "Lulus L2", name: "Lulus Level 2", percent: 62, detail: "5 dari 8 karyawan" },
      { key: "accepted", label: "Use Case Diterima", name: "Use Case Diterima", percent: 75, detail: "6 dari 8 submission" },
      { key: "participation", label: "Partisipasi", name: "Partisipasi Aktif", percent: 88, detail: "7 dari 8 aktif 7 hari terakhir" },
      { key: "pre_assessment", label: "Pre-Assessment", name: "Pre-Assessment Selesai", percent: 100, detail: "8 dari 8 karyawan" },
    ],
  };
}

export function getSponsorRecentActivityMock() {
  return {
    activity: [
      { type: "submission" as const, actor: "Rizki Pratama", action: "mengirim use case", meta: "Otomatisasi Laporan Mingguan", time: "1 hari lalu", at: daysAgo(1) },
      { type: "accepted" as const, actor: "Andra Wicaksono", action: "menerima use case dari Nadia Anggraini", meta: "Chatbot FAQ Internal", time: "5 hari lalu", at: daysAgo(5) },
      { type: "review" as const, actor: "Maya Sari", action: "mereview submission", meta: "Ringkasan Notulen Rapat", time: "6 hari lalu", at: daysAgo(6) },
      { type: "assessment" as const, actor: "Sari Melati", action: "menyelesaikan pre-assessment", meta: null, time: "9 hari lalu", at: daysAgo(9) },
    ],
  };
}

export function getWeeklyTrendsMock() {
  return {
    weeks: Array.from({ length: 12 }, (_, i) => ({
      label: `W${i + 1}`,
      hours_saved: round1(2 + Math.sin(i / 2) * 1.5 + i * 0.3),
      adoption_percent: Math.min(95, 40 + i * 4),
      highlight: i === 11,
    })),
  };
}

export function getProficiencyTrendsMock() {
  return {
    weeks: Array.from({ length: 12 }, (_, i) => ({
      label: `W${i + 1}`,
      avg_level: round1(0.5 + i * 0.13),
      avg_xp: Math.round(50 + i * 75),
      highlight: i === 11,
    })),
  };
}

export function getLevelDistributionMock() {
  const levels = LEVELS.map((l) => {
    const count = MEMBER_ROSTER.filter((m) => m.current_level.level_number === l.level_number).length;
    return { id: l.id, code: `L${l.level_number}`, label: `L${l.level_number}`, name: l.name, count, percent: pct(count, TOTAL_MEMBERS) };
  });

  const groups = GROUPS.map((g) => {
    const members = MEMBER_ROSTER.filter((m) => m.group_id === g.id);
    const entryLevel = members.filter((m) => m.current_level.level_number <= 1).length;
    return {
      id: g.id,
      name: g.name,
      total: members.length,
      active_weekly: members.filter((m) => m.status !== "behind").length,
      entry_level_count: entryLevel,
      entry_level_percent: pct(entryLevel, members.length),
      levels: LEVELS.map((l) => ({
        level_id: l.id,
        code: `L${l.level_number}`,
        label: `L${l.level_number}`,
        count: members.filter((m) => m.current_level.level_number === l.level_number).length,
      })),
    };
  });

  return {
    total: TOTAL_MEMBERS,
    active_weekly: MEMBER_ROSTER.filter((m) => m.status !== "behind").length,
    participation_percent: pct(MEMBER_ROSTER.filter((m) => m.status !== "behind").length, TOTAL_MEMBERS),
    levels,
    groups,
    groups_needing_intervention: groups.filter((g) => g.entry_level_percent >= 35),
  };
}

export function getWorkforceMembersMock() {
  return {
    total: TOTAL_MEMBERS,
    departments: GROUPS.map((g) => ({ id: g.id, name: g.name })),
    list: MEMBER_ROSTER.map((m) => {
      const group = GROUPS.find((g) => g.id === m.group_id)!;
      const segment = m.current_level.level_number >= 3 ? "Promotor" : m.current_level.level_number === 2 ? "Netral" : "Resistor";
      return {
        member_id: m.member_id,
        user: m.user,
        department: { id: group.id, name: group.name },
        job_title: m.job_title,
        current_level: m.current_level,
        score: round1(m.current_level.level_number * 1.1),
        progress_percent: m.progress_percent,
        segment: segment as "Promotor" | "Netral" | "Resistor",
        hours_saved_weekly: round1(m.use_case_count * 0.8),
        status: { kind: m.status, label: m.status === "on_track" ? "Aktif" : m.status === "at_risk" ? "Perlu perhatian" : "Tidak aktif" },
      };
    }),
  };
}

export function getOrganizationLeaderboardMock() {
  const maxScore = 5;
  const list = GROUPS.map((g) => {
    const members = MEMBER_ROSTER.filter((m) => m.group_id === g.id);
    const avgScore = round1(
      (members.reduce((s, m) => s + m.current_level.level_number, 0) / members.length / 4) * maxScore
    );
    return {
      id: g.id,
      name: g.name,
      member_count: members.length,
      avg_score: avgScore,
      top_use_case: "Otomatisasi Laporan Mingguan",
      submission_count: members.reduce((s, m) => s + m.use_case_count, 0),
      hours: round1(members.reduce((s, m) => s + m.use_case_count, 0) * 1.2),
      trend_percent: 8,
      rank: 0,
    };
  })
    .sort((a, b) => b.avg_score - a.avg_score)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  return { max_score: maxScore, list };
}

// --- read.group.* ---

function findGroup(groupId: number) {
  return GROUPS.find((g) => g.id === groupId) ?? null;
}

export function getGroupDepartmentsMock() {
  return {
    departments: GROUPS.map((g) => ({
      id: g.id,
      name: g.name,
      member_count: MEMBER_ROSTER.filter((m) => m.group_id === g.id).length,
    })),
  };
}

export function getGroupOverviewMock(input: { group_id: number }) {
  const group = findGroup(input.group_id);
  if (!group) return null;
  const members = MEMBER_ROSTER.filter((m) => m.group_id === input.group_id);
  const beginnerCount = members.filter((m) => m.current_level.level_number <= 1).length;
  return {
    group: { id: group.id, name: group.name, champion: group.champion },
    metrics: {
      total_members: members.length,
      active_members: members.filter((m) => m.status !== "behind").length,
      active_percent: pct(members.filter((m) => m.status !== "behind").length, members.length),
      avg_level: round1(members.reduce((s, m) => s + m.current_level.level_number, 0) / members.length),
      beginner_count: beginnerCount,
      beginner_percent: pct(beginnerCount, members.length),
      hours_saved_total: round1(members.reduce((s, m) => s + m.use_case_count, 0) * 1.2),
      accepted_use_cases: members.reduce((s, m) => s + m.use_case_count, 0),
      accepted_use_cases_this_month: Math.min(3, members.length),
      needs_intervention: pct(beginnerCount, members.length) >= 35,
    },
  };
}

export function getGroupLevelDistributionMock(input: { group_id: number }) {
  const members = MEMBER_ROSTER.filter((m) => m.group_id === input.group_id);
  return {
    total_members: members.length,
    levels: LEVELS.map((l) => {
      const count = members.filter((m) => m.current_level.level_number === l.level_number).length;
      return { id: l.id, level_number: l.level_number, code: `L${l.level_number}`, name: l.name, count, percent: pct(count, members.length) };
    }),
  };
}

export function getGroupTopUseCasesMock(_input: { group_id: number }) {
  return {
    total: 4,
    use_cases: [
      { id: 1, name: "Otomatisasi Laporan Mingguan", level_code: "L2", level_name: levelByNumber(2).name, count: 2, percent: 50 },
      { id: 2, name: "Chatbot FAQ Internal", level_code: "L3", level_name: levelByNumber(3).name, count: 1, percent: 25 },
      { id: 3, name: "Ringkasan Notulen Rapat", level_code: "L1", level_name: levelByNumber(1).name, count: 1, percent: 25 },
    ],
  };
}

export function getGroupAttentionMembersMock(input: { group_id: number }) {
  const members = MEMBER_ROSTER.filter((m) => m.group_id === input.group_id);
  const rows = members.map((m) => ({
    id: m.member_id,
    full_name: m.user.full_name,
    avatar: m.user.avatar,
    job_title: m.job_title,
    level_number: m.current_level.level_number,
    level_name: m.current_level.name,
    accepted_use_cases: m.use_case_count,
    inactive_days: m.last_active_at ? Math.round((Date.now() - m.last_active_at.getTime()) / 86_400_000) : null,
    status: m.status === "on_track" ? "Aktif" : m.status === "at_risk" ? `Pasif ${m.last_active_at ? "" : ""}`.trim() : "Belum mulai",
    needs_attention: m.status !== "on_track",
    score: m.status === "behind" ? 5 : m.status === "at_risk" ? 3 : 0,
  }));
  return { lagging_count: rows.filter((r) => r.needs_attention).length, members: rows };
}

// --- read.outcome.* ---

export function getOutcomeOverviewMock() {
  const certified = MEMBER_ROSTER.filter((m) => m.current_level.level_number >= 1).length;
  return {
    member_count: TOTAL_MEMBERS,
    department_count: GROUPS.length,
    hours_saved_total: HOURS_SAVED_TOTAL,
    fte_equivalent: round1(HOURS_SAVED_TOTAL / 1_760),
    roi_total: HOURS_SAVED_TOTAL * ROI_VALUE_PER_HOUR,
    roi_rate_per_hour: ROI_VALUE_PER_HOUR,
    avg_level: AVG_LEVEL,
    max_level_number: LEVELS[LEVELS.length - 1].level_number,
    certified_count: certified,
    certified_percent: pct(certified, TOTAL_MEMBERS),
  };
}

export function getOutcomeLevelDistributionMock() {
  return {
    total: TOTAL_MEMBERS,
    distribution: LEVELS.map((l) => {
      const count = MEMBER_ROSTER.filter((m) => m.current_level.level_number === l.level_number).length;
      return { level_number: l.level_number, code: `L${l.level_number}`, name: l.name, count, percent: pct(count, TOTAL_MEMBERS) };
    }),
  };
}

export function getRoiTrendMock() {
  return {
    months: Array.from({ length: 6 }, (_, i) => {
      const value = Math.round((HOURS_SAVED_TOTAL / 6) * (i + 1) * ROI_VALUE_PER_HOUR);
      return {
        label: `M${i + 1}`,
        month: daysAgo((5 - i) * 30).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        roi_value: value,
        roi_billion: round1(value / 1_000_000_000),
        projected: i >= 4,
      };
    }),
  };
}

export function getDepartmentRoiMock() {
  const departments = GROUPS.map((g) => {
    const members = MEMBER_ROSTER.filter((m) => m.group_id === g.id);
    const hoursWeekly = round1(members.reduce((s, m) => s + m.use_case_count, 0) * 0.3);
    const hoursTotal = round1(hoursWeekly * 6);
    return {
      id: g.id,
      name: g.name,
      member_count: members.length,
      hours_saved_weekly: hoursWeekly,
      hours_saved_total: hoursTotal,
      roi_annualized: Math.round(hoursWeekly * 52 * ROI_VALUE_PER_HOUR),
    };
  });
  const totalRoi = departments.reduce((s, d) => s + d.roi_annualized, 0);
  return {
    total_roi_annualized: totalRoi,
    departments: departments
      .map((d) => ({ ...d, contribution_percent: pct(d.roi_annualized, totalRoi) }))
      .sort((a, b) => b.roi_annualized - a.roi_annualized),
  };
}

export function getTopPerformersMock() {
  const maxLevelNumber = LEVELS[LEVELS.length - 1].level_number;
  const maxXp = Math.max(1, ...MEMBER_ROSTER.map((m) => m.total_xp));
  const maxHours = Math.max(1, ...MEMBER_ROSTER.map((m) => m.use_case_count * 1.2));
  const maxUseCases = Math.max(1, ...MEMBER_ROSTER.map((m) => m.use_case_count));

  const list = MEMBER_ROSTER.map((m) => {
    const group = GROUPS.find((g) => g.id === m.group_id)!;
    const hours = round1(m.use_case_count * 1.2);
    const composite = Math.round(
      100 *
        (0.4 * (m.total_xp / maxXp) +
          0.25 * (hours / maxHours) +
          0.2 * (m.use_case_count / maxUseCases) +
          0.15 * (m.current_level.level_number / maxLevelNumber))
    );
    return {
      member_id: m.member_id,
      full_name: m.user.full_name,
      avatar: m.user.avatar,
      department: group.name,
      level_number: m.current_level.level_number,
      level_code: `L${m.current_level.level_number}`,
      level_name: m.current_level.name,
      xp: m.total_xp,
      use_case_count: m.use_case_count,
      hours,
      composite,
    };
  })
    .sort((a, b) => b.composite - a.composite)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  return { total: list.length, list };
}

// --- pre-assessment (org-wide) ---

function orgPillars(base: number) {
  return PILLAR_DEFS.map((p, i) => ({ key: p.key, score: Math.min(5, round1(base + (i % 3) * 0.15)) }));
}

export function getPreAssessmentOrganizationMock() {
  const departments = GROUPS.map((g) => {
    const members = MEMBER_ROSTER.filter((m) => m.group_id === g.id);
    return {
      id: g.id,
      name: g.name,
      member_count: members.length,
      completed_count: members.length,
      completion_percent: 100,
      pillars: orgPillars(2.5 + g.id * 0.15),
      avg: round1(2.5 + g.id * 0.15),
    };
  });
  const orgAvg = round1(departments.reduce((s, d) => s + d.avg, 0) / departments.length);

  return {
    department_count: departments.length,
    total_members: TOTAL_MEMBERS,
    completed_count: TOTAL_MEMBERS,
    measured_at: daysAgo(14),
    target: 3.5,
    org_avg: orgAvg,
    ready_count: MEMBER_ROSTER.filter((m) => m.current_level.level_number >= 3).length,
    gap_large_count: MEMBER_ROSTER.filter((m) => m.current_level.level_number <= 1).length,
    departments,
    org_pillars: orgPillars(orgAvg).sort((a, b) => a.score - b.score),
    readiness: {
      ready: MEMBER_ROSTER.filter((m) => m.current_level.level_number >= 3).length,
      developing: MEMBER_ROSTER.filter((m) => m.current_level.level_number === 2).length,
      basic: MEMBER_ROSTER.filter((m) => m.current_level.level_number <= 1).length,
    },
  };
}
