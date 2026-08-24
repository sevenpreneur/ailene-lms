// Shared shapes for src/mock-data/* — mirrors the payload fields the old tRPC
// procedures used to return, minus the {code,message} envelope (no network
// boundary anymore, so it added nothing). Delete this whole folder once
// ailene-lms-backend (Java) ships real endpoints for these.

export type LevelRef = {
  id: number;
  level_number: number;
  name: string;
  icon: string;
};

export type LevelMock = LevelRef & {
  min_xp: number;
  status: "ACTIVE" | "INACTIVE";
};

export type CategoryRef = { id: number; name: string };

export type PersonRef = {
  id: number;
  full_name: string;
  avatar: string | null;
};

export type GroupRef = { id: number; name: string };

export type MemberStatus = "on_track" | "at_risk" | "behind";

export type ChapterMock = {
  id: number;
  name: string;
  description: string | null;
  session_date: Date;
  level_id: number;
  level: LevelRef;
};

export type AilMemberMock = {
  id: number;
  job_title: string;
  group: GroupRef | null;
  championed_groups: (GroupRef & { member_count: number })[];
  current_level: LevelMock;
  total_xp: number;
  created_at: Date;
};

export type MemberRosterEntry = {
  member_id: number;
  user: { id: string; full_name: string; email: string; avatar: string | null };
  group_id: number;
  job_title: string;
  current_level: LevelMock;
  total_xp: number;
  progress_percent: number;
  use_case_count: number;
  last_active_at: Date | null;
  status: MemberStatus;
};

export type SubmissionKind = "PROMPT" | "USE_CASE";

export type PracticeSubmissionMock = {
  id: number;
  kind: SubmissionKind;
  ref_id: number;
  title: string;
  body: string;
  level: LevelRef;
  categories: CategoryRef[];
  member: PersonRef;
  assigned_by: PersonRef | null;
  reviewed_by: PersonRef | null;
  deadline: Date | null;
  message: string | null;
  submitted_at: Date | null;
  reviewed_at: Date | null;
  comment: string | null;
  is_accepted: boolean;
  hours_with_ai?: number | null;
  ai_tool?: string | null;
};
