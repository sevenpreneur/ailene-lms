// Shared shapes for src/mock-data/*; delete this folder once ailene-lms-backend ships real endpoints.

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

export type GroupRef = { id: number; name: string };

export type MemberStatus = "on_track" | "at_risk" | "behind";

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
