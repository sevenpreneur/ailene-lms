// Champion-facing mock data — team dashboard, assignment, submissions review,
// pre-assessment team view, and the weekly/monthly champion report.

import {
  CATEGORIES,
  GROUPS,
  MEMBER_ROSTER,
  PILLAR_DEFS,
  SPONSOR_PERSON,
  getMemberByIdMock,
  levelByNumber,
} from "./shared";
import { daysAgo, pct, round1 } from "./utils";

export function getTeamMembersMock(input?: { group_id?: number }) {
  const list =
    input?.group_id == null
      ? MEMBER_ROSTER
      : MEMBER_ROSTER.filter((m) => m.group_id === input.group_id);

  const weekAgo = daysAgo(7);
  const stats = {
    total: list.length,
    on_track: list.filter((m) => m.status === "on_track").length,
    at_risk: list.filter((m) => m.status === "at_risk").length,
    behind: list.filter((m) => m.status === "behind").length,
    active_this_week: list.filter(
      (m) => m.last_active_at && m.last_active_at >= weekAgo
    ).length,
    submissions_sent: 12,
    members_submitted: list.filter((m) => m.use_case_count > 0).length,
    hours_saved: 46,
  };

  return {
    stats,
    list: list.map((m) => ({
      member_id: m.member_id,
      user: m.user,
      current_level: m.current_level,
      total_xp: m.total_xp,
      progress_percent: m.progress_percent,
      use_case_count: m.use_case_count,
      current_chapter: null as { id: number; name: string } | null,
      last_active_at: m.last_active_at,
      status: m.status,
    })),
  };
}

export const PROMPT_LIBRARY = [
  {
    id: 1,
    name: "Ringkasan Notulen Rapat",
    scenario: "Ubah transkrip rapat panjang jadi ringkasan poin aksi.",
    expected_output: "Daftar poin aksi dengan PIC dan deadline.",
    level: levelByNumber(1),
    categories: [CATEGORIES[0]],
    created_at: daysAgo(40),
  },
  {
    id: 2,
    name: "Analisis Data Penjualan",
    scenario: "Minta AI membaca tabel penjualan dan menemukan tren utama.",
    expected_output: "3-5 insight tren beserta rekomendasi tindak lanjut.",
    level: levelByNumber(2),
    categories: [CATEGORIES[3]],
    created_at: daysAgo(35),
  },
  {
    id: 3,
    name: "Draft Kebijakan Internal",
    scenario: "Susun draft kebijakan WFH berdasarkan poin-poin diskusi.",
    expected_output: "Draft kebijakan siap review, format formal.",
    level: levelByNumber(3),
    categories: [CATEGORIES[0]],
    created_at: daysAgo(30),
  },
] as const;

export const USE_CASE_LIBRARY = [
  {
    id: 1,
    name: "Otomatisasi Laporan Mingguan",
    description: "Pakai AI untuk menyusun laporan mingguan dari data mentah.",
    level: levelByNumber(2),
    categories: [CATEGORIES[2]],
    created_at: daysAgo(38),
  },
  {
    id: 2,
    name: "Chatbot FAQ Internal",
    description: "Bangun prototipe chatbot untuk menjawab pertanyaan HR umum.",
    level: levelByNumber(3),
    categories: [CATEGORIES[0], CATEGORIES[4]],
    created_at: daysAgo(28),
  },
] as const;

function championSubmissionBase(memberId: number) {
  const member = getMemberByIdMock(memberId);
  return {
    member: member
      ? {
          id: member.member_id,
          full_name: member.user.full_name,
          email: member.user.email,
          avatar: member.user.avatar,
        }
      : { id: memberId, full_name: "—", email: "—", avatar: null },
  };
}

export const PROMPT_SUBMISSIONS_CHAMPION = [
  {
    id: 1,
    prompt: {
      id: 1,
      name: PROMPT_LIBRARY[0].name,
      scenario: PROMPT_LIBRARY[0].scenario,
      expected_output: PROMPT_LIBRARY[0].expected_output,
      level: PROMPT_LIBRARY[0].level,
      categories: PROMPT_LIBRARY[0].categories,
    },
    ...championSubmissionBase(1),
    deadline: daysAgo(-2),
    submitted_at: daysAgo(1),
    reviewed_at: null,
    is_accepted: false,
  },
  {
    id: 2,
    prompt: {
      id: 2,
      name: PROMPT_LIBRARY[1].name,
      scenario: PROMPT_LIBRARY[1].scenario,
      expected_output: PROMPT_LIBRARY[1].expected_output,
      level: PROMPT_LIBRARY[1].level,
      categories: PROMPT_LIBRARY[1].categories,
    },
    ...championSubmissionBase(4),
    deadline: daysAgo(3),
    submitted_at: daysAgo(4),
    reviewed_at: daysAgo(2),
    is_accepted: true,
  },
];

export const USE_CASE_SUBMISSIONS_CHAMPION = [
  {
    id: 1,
    use_case: { id: 1, name: USE_CASE_LIBRARY[0].name, description: USE_CASE_LIBRARY[0].description, level: USE_CASE_LIBRARY[0].level, categories: USE_CASE_LIBRARY[0].categories },
    ...championSubmissionBase(6),
    deadline: daysAgo(-1),
    submitted_at: daysAgo(0),
    reviewed_at: null,
    is_accepted: false,
    hours_with_ai: 2,
    ai_tool: "ChatGPT",
  },
  {
    id: 2,
    use_case: { id: 2, name: USE_CASE_LIBRARY[1].name, description: USE_CASE_LIBRARY[1].description, level: USE_CASE_LIBRARY[1].level, categories: USE_CASE_LIBRARY[1].categories },
    ...championSubmissionBase(8),
    deadline: daysAgo(6),
    submitted_at: daysAgo(7),
    reviewed_at: daysAgo(5),
    is_accepted: true,
    hours_with_ai: 3,
    ai_tool: "Claude",
  },
];

export function getPromptSubmissionsMock() {
  return PROMPT_SUBMISSIONS_CHAMPION;
}

export function getUseCaseSubmissionsMock() {
  return USE_CASE_SUBMISSIONS_CHAMPION;
}

export function getPromptSubmissionDetailMock(input: { submission_id: number }) {
  const base = PROMPT_SUBMISSIONS_CHAMPION.find((s) => s.id === input.submission_id);
  if (!base) return null;
  return {
    ...base,
    reviewed_by: base.reviewed_at ? { id: 0, full_name: "Andra Wicaksono", avatar: null } : null,
    message: "Tolong fokuskan ke rapat divisi minggu ini.",
    input: "Transkrip rapat: pembahasan target Q3, kendala supply chain, rencana campaign baru...",
    output: "1. Follow up supplier (PIC: Dian, deadline Jumat)\n2. Siapkan draft campaign (PIC: Rizki)\n3. Review budget Q3 (PIC: Nadia)",
    comment: base.is_accepted ? "Mantap, poin aksinya jelas dan actionable." : null,
    rubric_specificity: base.is_accepted ? 4 : null,
    rubric_context: base.is_accepted ? 4 : null,
    rubric_constraints: base.is_accepted ? 3 : null,
    rubric_examples: base.is_accepted ? 3 : null,
    rubric_iteration: base.is_accepted ? 4 : null,
  };
}

export function getUseCaseSubmissionDetailMock(input: { submission_id: number }) {
  const base = USE_CASE_SUBMISSIONS_CHAMPION.find((s) => s.id === input.submission_id);
  if (!base) return null;
  return {
    ...base,
    reviewed_by: base.reviewed_at ? { id: 0, full_name: "Andra Wicaksono", avatar: null } : null,
    message: "Coba terapkan ke laporan mingguan tim.",
    outcome_proof: "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/sample-proof.pdf",
    hours_without_ai: 6,
    description: "Menyusun laporan mingguan otomatis dari data mentah pakai AI, dari 6 jam jadi 2 jam kerja.",
    frequency: "WEEKLY" as const,
    type: "AUTOMATION" as const,
    comment: base.is_accepted ? "Bagus, hemat waktu signifikan." : null,
  };
}

export function getCoachingNotesMock() {
  return [
    {
      id: 1,
      text: "Fokus ke konsistensi praktik mingguan, jangan cuma di akhir deadline.",
      created_at: daysAgo(10),
      champion: { id: 201, role: "SPONSOR", full_name: SPONSOR_PERSON.full_name, avatar: SPONSOR_PERSON.avatar },
    },
    {
      id: 2,
      text: "Progress tim bagus, pertahankan momentum use case submission.",
      created_at: daysAgo(3),
      champion: { id: 201, role: "SPONSOR", full_name: SPONSOR_PERSON.full_name, avatar: SPONSOR_PERSON.avatar },
    },
  ];
}

function teamPillars(base: number) {
  return PILLAR_DEFS.map((p, i) => ({ key: p.key, score: Math.min(5, round1(base + (i % 3) * 0.2)) }));
}

function weakestPillarKey(pillars: { key: string; score: number }[]) {
  return pillars.reduce((min, p) => (p.score < min.score ? p : min), pillars[0])
    .key;
}

export function getPreAssessmentTeamMock() {
  const departments = GROUPS.map((g) => {
    const members = MEMBER_ROSTER.filter((m) => m.group_id === g.id);
    const completed = members.length;
    return {
      id: g.id,
      name: g.name,
      member_count: members.length,
      completed_count: completed,
      completion_percent: 100,
      pillars: teamPillars(2.8 + g.id * 0.2),
      avg: round1(2.8 + g.id * 0.2),
      members: members.map((m) => {
        const pillars = teamPillars(2.5 + m.current_level.level_number * 0.4);
        return {
          member_id: m.member_id,
          name: m.user.full_name,
          avatar: m.user.avatar,
          pillars,
          weakest_key: weakestPillarKey(pillars),
          avg: round1(
            pillars.reduce((s, p) => s + p.score, 0) / pillars.length
          ),
        };
      }),
    };
  });

  const teamAvg = round1(
    departments.reduce((s, d) => s + d.avg, 0) / departments.length
  );

  return {
    department_count: departments.length,
    total_members: MEMBER_ROSTER.length,
    completed_count: MEMBER_ROSTER.length,
    measured_at: daysAgo(14),
    target: 3.5,
    org_avg: teamAvg,
    team_avg: teamAvg,
    ready_count: MEMBER_ROSTER.filter((m) => m.current_level.level_number >= 2).length,
    gap_large_count: MEMBER_ROSTER.filter((m) => m.current_level.level_number <= 1).length,
    departments,
    // Ranking widgets assume ascending-by-score order (coaching priority).
    org_pillars: teamPillars(teamAvg)
      .slice()
      .sort((a, b) => a.score - b.score),
    team_pillars: teamPillars(teamAvg)
      .slice()
      .sort((a, b) => a.score - b.score),
    readiness: {
      ready: MEMBER_ROSTER.filter((m) => m.current_level.level_number >= 3).length,
      developing: MEMBER_ROSTER.filter((m) => m.current_level.level_number === 2).length,
      basic: MEMBER_ROSTER.filter((m) => m.current_level.level_number <= 1).length,
    },
  };
}

export function getMemberDetailMock(input: { member_id: number }) {
  const member = getMemberByIdMock(input.member_id);
  if (!member) return null;

  const levelNumber = member.current_level.level_number;
  const nextLevel = levelByNumber(Math.min(4, levelNumber + 1));

  const group = GROUPS.find((g) => g.id === member.group_id) ?? null;

  return {
    member: {
      id: member.member_id,
      full_name: member.user.full_name,
      avatar: member.user.avatar,
      job_title: member.job_title,
      group: group ? { id: group.id, name: group.name } : null,
      current_level: member.current_level,
      total_xp: member.total_xp,
    },
    metrics: {
      gate_percent: member.progress_percent,
      streak_days: Math.max(0, 12 - levelNumber * 2),
      submission_total: member.use_case_count,
      avg_quiz: 72 + levelNumber * 5,
    },
    radar: {
      total_submissions: member.use_case_count,
      dimensions: PILLAR_DEFS.map((p, i) => ({
        key: p.key,
        label: p.name,
        score: Math.min(5, round1(1.8 + levelNumber * 0.5 + (i % 2) * 0.3)),
      })),
    },
    gate: {
      from_level: levelNumber,
      to_level: nextLevel.level_number,
      next_level_id: nextLevel.id,
      done: Math.min(3, levelNumber + 1),
      total: 4,
      percent: member.progress_percent,
      ready: member.progress_percent >= 80,
      requirements: [
        { label: "Selesaikan semua chapter level ini", completed: levelNumber >= 1 },
        { label: "Lulus quiz akhir level", completed: levelNumber >= 1 },
        { label: "Minimal 1 use case diterima", completed: member.use_case_count > 0 },
        { label: "Aktif dalam 14 hari terakhir", completed: member.status !== "behind" },
      ],
    },
    activities: [
      { id: 1, type: "submission", title: "Mengirim use case baru", subtitle: USE_CASE_LIBRARY[0].name, status: "pending", occurred_at: daysAgo(1) },
      { id: 2, type: "quiz", title: "Menyelesaikan quiz", subtitle: "AI untuk Produktivitas Kerja", status: "completed", occurred_at: daysAgo(4) },
      { id: 3, type: "material", title: "Membaca materi", subtitle: "Pengenalan AI & Prompting Dasar", status: "completed", occurred_at: daysAgo(9) },
    ],
    notes: getCoachingNotesMock().map((n) => ({
      id: n.id,
      text: n.text,
      created_at: n.created_at,
      champion_name: n.champion.full_name,
    })),
  };
}

export function getChampionReportMock(input?: { period?: "weekly" | "monthly" }) {
  const period = input?.period ?? "weekly";
  const now = new Date();
  const total = MEMBER_ROSTER.length;
  const active = MEMBER_ROSTER.filter((m) => m.status !== "behind").length;

  return {
    period,
    generated_at: now,
    report: {
      title:
        period === "monthly"
          ? "Laporan Bulanan - Tim Digital Transformation"
          : "Laporan Mingguan - Tim Digital Transformation",
      team_name: "Digital Transformation",
      champion_name: "Andra Wicaksono",
      status: "draft_auto_generated" as const,
    },
    recipient: SPONSOR_PERSON,
    metrics: {
      active_members: active,
      total_members: total,
      active_percent: pct(active, total),
      accepted_submissions: 6,
      hours_saved: 18.5,
      level_ups: 2,
    },
    level_movements: [
      { from: "L1", to: "L2", count: 1, note: "Dian Kusuma" },
      { from: "L2", to: "L3", count: 1, note: "Rizki Pratama" },
      { from: "L3", to: "L4", count: 0, note: "Belum ada perpindahan" },
    ],
    narrative:
      "Momentum tim berjalan positif. 6 submission diterima dan estimasi 18.5 jam kerja berhasil dihemat. 2 anggota naik level; fokus berikutnya menjaga konsistensi praktik. Use case menonjol: " +
      USE_CASE_LIBRARY[0].name +
      ".",
    sent_reports: [1, 2, 3].map((offset) => ({
      id: `${period}-${offset}`,
      title: `Laporan Mingguan - ${daysAgo(offset * 7).toLocaleDateString("id-ID")}`,
      sent_at: daysAgo(offset * 7),
      recipient: SPONSOR_PERSON.full_name,
    })),
    previous_period_start: daysAgo(period === "monthly" ? 30 : 7),
  };
}
