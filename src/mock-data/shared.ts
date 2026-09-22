import type { AilMemberMock, LevelMock, MemberRosterEntry } from "./types";
import { daysAgo } from "./utils";

export const LEVELS: LevelMock[] = [
  {
    id: 1,
    level_number: 0,
    name: "Assessment",
    icon: "🎯",
    min_xp: 0,
    status: "ACTIVE",
  },
  {
    id: 2,
    level_number: 1,
    name: "Foundation",
    icon: "🌱",
    min_xp: 100,
    status: "ACTIVE",
  },
  {
    id: 3,
    level_number: 2,
    name: "Practitioner",
    icon: "⚡",
    min_xp: 400,
    status: "ACTIVE",
  },
  {
    id: 4,
    level_number: 3,
    name: "Advanced Practitioner",
    icon: "🚀",
    min_xp: 900,
    status: "ACTIVE",
  },
  {
    id: 5,
    level_number: 4,
    name: "Advanced",
    icon: "🏆",
    min_xp: 1600,
    status: "ACTIVE",
  },
];

export function levelByNumber(levelNumber: number): LevelMock {
  return LEVELS.find((l) => l.level_number === levelNumber) ?? LEVELS[0];
}

// Six competency pillars; keys match the pillar keys ailene-lms-api returns.
export const PILLAR_DEFS: { key: string; name: string }[] = [
  { key: "ai_foundation", name: "AI Foundation" },
  { key: "prompting", name: "Prompting" },
  { key: "tool_fluency", name: "Tool Fluency" },
  { key: "use_case_diversity", name: "Use Case" },
  { key: "ai_habit", name: "AI Habit" },
  { key: "agentic", name: "Agentic" },
];

// The team a champion manages (never includes the champion themselves).
export const MEMBER_ROSTER: MemberRosterEntry[] = [
  {
    member_id: 1,
    user: {
      id: "m1",
      full_name: "Rizki Pratama",
      email: "rizki.pratama@example.com",
      avatar: null,
    },
    group_id: 1,
    job_title: "Digital Product Analyst",
    current_level: levelByNumber(3),
    total_xp: 1050,
    progress_percent: 80,
    use_case_count: 5,
    last_active_at: daysAgo(1),
    status: "on_track",
  },
  {
    member_id: 2,
    user: {
      id: "m2",
      full_name: "Dian Kusuma",
      email: "dian.kusuma@example.com",
      avatar: null,
    },
    group_id: 1,
    job_title: "IT Business Partner",
    current_level: levelByNumber(2),
    total_xp: 520,
    progress_percent: 55,
    use_case_count: 3,
    last_active_at: daysAgo(2),
    status: "on_track",
  },
  {
    member_id: 3,
    user: {
      id: "m3",
      full_name: "Bagas Wirawan",
      email: "bagas.wirawan@example.com",
      avatar: null,
    },
    group_id: 2,
    job_title: "Marketing Specialist",
    current_level: levelByNumber(1),
    total_xp: 180,
    progress_percent: 35,
    use_case_count: 1,
    last_active_at: daysAgo(9),
    status: "at_risk",
  },
  {
    member_id: 4,
    user: {
      id: "m4",
      full_name: "Sari Melati",
      email: "sari.melati@example.com",
      avatar: null,
    },
    group_id: 2,
    job_title: "Growth Marketing Lead",
    current_level: levelByNumber(4),
    total_xp: 1750,
    progress_percent: 100,
    use_case_count: 7,
    last_active_at: daysAgo(0),
    status: "on_track",
  },
  {
    member_id: 5,
    user: {
      id: "m5",
      full_name: "Fajar Nugroho",
      email: "fajar.nugroho@example.com",
      avatar: null,
    },
    group_id: 3,
    job_title: "Operations Staff",
    current_level: levelByNumber(0),
    total_xp: 20,
    progress_percent: 10,
    use_case_count: 0,
    last_active_at: null,
    status: "behind",
  },
  {
    member_id: 6,
    user: {
      id: "m6",
      full_name: "Intan Permata",
      email: "intan.permata@example.com",
      avatar: null,
    },
    group_id: 3,
    job_title: "Supply Chain Analyst",
    current_level: levelByNumber(2),
    total_xp: 600,
    progress_percent: 55,
    use_case_count: 3,
    last_active_at: daysAgo(3),
    status: "on_track",
  },
  {
    member_id: 7,
    user: {
      id: "m7",
      full_name: "Yoga Saputra",
      email: "yoga.saputra@example.com",
      avatar: null,
    },
    group_id: 4,
    job_title: "Finance Officer",
    current_level: levelByNumber(1),
    total_xp: 150,
    progress_percent: 35,
    use_case_count: 1,
    last_active_at: daysAgo(10),
    status: "at_risk",
  },
  {
    member_id: 8,
    user: {
      id: "m8",
      full_name: "Nadia Anggraini",
      email: "nadia.anggraini@example.com",
      avatar: null,
    },
    group_id: 4,
    job_title: "Financial Planning Analyst",
    current_level: levelByNumber(3),
    total_xp: 1100,
    progress_percent: 80,
    use_case_count: 5,
    last_active_at: daysAgo(1),
    status: "on_track",
  },
];

// The signed-in user's own learning data; id 0 is reserved for them, outside MEMBER_ROSTER's 1-8 range.
export function getAilMemberMock(_input?: {
  projectId?: string;
  userId?: string;
}): AilMemberMock {
  return {
    id: 0,
    job_title: "Digital Product Analyst",
    group: { id: 1, name: "Digital Transformation" },
    championed_groups: [
      { id: 1, name: "Digital Transformation", member_count: 2 },
    ],
    current_level: levelByNumber(3),
    total_xp: 1050,
    created_at: daysAgo(60),
  };
}
