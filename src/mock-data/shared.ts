// Cross-role catalog data (levels, chapters, groups, member roster) plus the
// "current session member" lookup that src/lib/gate.ts and the shared
// Sidebar/label components depend on.

import type {
  AilMemberMock,
  ChapterMock,
  CategoryRef,
  GroupRef,
  LevelMock,
  MemberRosterEntry,
} from "./types";
import { daysAgo } from "./utils";

export const LEVELS: LevelMock[] = [
  { id: 1, level_number: 0, name: "Assessment", icon: "🎯", min_xp: 0, status: "ACTIVE" },
  { id: 2, level_number: 1, name: "Foundation", icon: "🌱", min_xp: 100, status: "ACTIVE" },
  { id: 3, level_number: 2, name: "Practitioner", icon: "⚡", min_xp: 400, status: "ACTIVE" },
  { id: 4, level_number: 3, name: "Advanced Practitioner", icon: "🚀", min_xp: 900, status: "ACTIVE" },
  { id: 5, level_number: 4, name: "Advanced", icon: "🏆", min_xp: 1600, status: "ACTIVE" },
];

export function getLevelsMock(): LevelMock[] {
  return LEVELS;
}

export function levelByNumber(levelNumber: number): LevelMock {
  return LEVELS.find((l) => l.level_number === levelNumber) ?? LEVELS[0];
}

export const CATEGORIES: CategoryRef[] = [
  { id: 1, name: "Human Capital" },
  { id: 2, name: "Finance" },
  { id: 3, name: "Operations" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "IT & Digital" },
];

export function getCategoriesMock(): CategoryRef[] {
  return CATEGORIES;
}

export const CHAPTERS: ChapterMock[] = [
  {
    id: 1,
    name: "Pengenalan AI & Prompting Dasar",
    description: "Dasar-dasar AI dan cara menyusun prompt yang efektif.",
    session_date: daysAgo(21),
    level_id: 2,
    level: LEVELS[1],
  },
  {
    id: 2,
    name: "AI untuk Produktivitas Kerja",
    description: "Menerapkan AI untuk mempercepat pekerjaan sehari-hari.",
    session_date: daysAgo(14),
    level_id: 3,
    level: LEVELS[2],
  },
  {
    id: 3,
    name: "Prompt Engineering Lanjutan",
    description: "Teknik prompting lanjutan untuk hasil yang lebih presisi.",
    session_date: daysAgo(7),
    level_id: 4,
    level: LEVELS[3],
  },
  {
    id: 4,
    name: "AI Workflow & Automasi",
    description: "Menghubungkan AI ke workflow kerja untuk otomasi.",
    session_date: daysAgo(-3),
    level_id: 5,
    level: LEVELS[4],
  },
];

export function getChaptersMock(): ChapterMock[] {
  return CHAPTERS;
}

export const GROUPS: (GroupRef & {
  champion: { id: number; full_name: string; avatar: string | null; job_title: string };
})[] = [
  {
    id: 1,
    name: "Digital Transformation",
    champion: { id: 101, full_name: "Andra Wicaksono", avatar: null, job_title: "Digital Transformation Lead" },
  },
  {
    id: 2,
    name: "Marketing & Sales",
    champion: { id: 102, full_name: "Maya Sari", avatar: null, job_title: "Marketing Lead" },
  },
  {
    id: 3,
    name: "Operasional",
    champion: { id: 103, full_name: "Dedi Kurniawan", avatar: null, job_title: "Operations Lead" },
  },
  {
    id: 4,
    name: "Keuangan",
    champion: { id: 104, full_name: "Rina Hartono", avatar: null, job_title: "Finance Lead" },
  },
];

export function getGroupsMock(): GroupRef[] {
  return GROUPS.map((g) => ({ id: g.id, name: g.name }));
}

// Six competency pillars, reused across competencyProfile, pre-assessment
// reports (student/champion/sponsor views), and radar charts. Keys match
// src/lib/pre-assessment-report.ts's PreAssessmentReportPillar so the same
// taxonomy holds end to end.
export const PILLAR_DEFS: { key: string; name: string }[] = [
  { key: "ai_foundation", name: "AI Foundation" },
  { key: "prompting", name: "Prompting" },
  { key: "tool_fluency", name: "Tool Fluency" },
  { key: "use_case_diversity", name: "Use Case" },
  { key: "ai_habit", name: "AI Habit" },
  { key: "agentic", name: "Agentic" },
];

export const SPONSOR_PERSON = {
  id: 201,
  full_name: "Denny Setiawan",
  avatar: null as string | null,
  job_title: "Chief HR Officer",
};

// The team a champion manages (never includes the champion themselves).
export const MEMBER_ROSTER: MemberRosterEntry[] = [
  {
    member_id: 1,
    user: { id: "m1", full_name: "Rizki Pratama", email: "rizki.pratama@example.com", avatar: null },
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
    user: { id: "m2", full_name: "Dian Kusuma", email: "dian.kusuma@example.com", avatar: null },
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
    user: { id: "m3", full_name: "Bagas Wirawan", email: "bagas.wirawan@example.com", avatar: null },
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
    user: { id: "m4", full_name: "Sari Melati", email: "sari.melati@example.com", avatar: null },
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
    user: { id: "m5", full_name: "Fajar Nugroho", email: "fajar.nugroho@example.com", avatar: null },
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
    user: { id: "m6", full_name: "Intan Permata", email: "intan.permata@example.com", avatar: null },
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
    user: { id: "m7", full_name: "Yoga Saputra", email: "yoga.saputra@example.com", avatar: null },
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
    user: { id: "m8", full_name: "Nadia Anggraini", email: "nadia.anggraini@example.com", avatar: null },
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

export function getMemberRosterMock(input?: { group_id?: number }): MemberRosterEntry[] {
  if (input?.group_id == null) return MEMBER_ROSTER;
  return MEMBER_ROSTER.filter((m) => m.group_id === input.group_id);
}

export function getMemberByIdMock(memberId: number): MemberRosterEntry | null {
  return MEMBER_ROSTER.find((m) => m.member_id === memberId) ?? null;
}

// The signed-in user's own AI-learning business data — role/identity come
// from the real ailene-lms-backend session, this is everything else.
// id 0 is reserved for "whoever is currently logged in" — kept out of
// MEMBER_ROSTER's 1-8 range so a champion never appears inside their own
// team list.
export function getAilMemberMock(_input?: {
  projectId?: string;
  userId?: string;
}): AilMemberMock {
  return {
    id: 0,
    job_title: "Digital Product Analyst",
    group: { id: 1, name: "Digital Transformation" },
    championed_groups: [{ id: 1, name: "Digital Transformation", member_count: 2 }],
    current_level: levelByNumber(3),
    total_xp: 1050,
    created_at: daysAgo(60),
  };
}

// Singleton announcement row — shared by the student ticker and sponsor's
// announcement management page (same underlying procedure before).
export function getAnnouncementMock(): {
  id: number;
  title: string;
  callout: string;
  status: "ACTIVE" | "INACTIVE";
  start_date: Date | null;
  end_date: Date | null;
  updated_at: Date;
} | null {
  return {
    id: 1,
    title: "Sesi Live Q&A Minggu Ini",
    callout:
      "Jangan lewatkan sesi live Q&A bareng tim AI Champion, Jumat jam 14.00 WIB.",
    status: "ACTIVE",
    start_date: daysAgo(2),
    end_date: daysAgo(-5),
    updated_at: daysAgo(2),
  };
}

// Defaulted to true — the pre-assessment submit action is a disabled mutation
// now, so a false default would permanently trap students behind a dead end.
export function getHasPreAssessmentMock(_input: {
  projectId: string;
  userId: string;
}): boolean {
  return true;
}
