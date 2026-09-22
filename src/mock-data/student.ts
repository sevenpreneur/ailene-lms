import { LEVELS, PILLAR_DEFS, levelByNumber } from "./shared";
import { daysAgo, relativeDayStrip, round1 } from "./utils";

const CURRENT_LEVEL_NUMBER = 3;
const CURRENT_XP = 1050;

export function getLevelProgressMock() {
  const nextLevel = levelByNumber(Math.min(4, CURRENT_LEVEL_NUMBER + 1));
  return {
    total_xp: CURRENT_XP,
    max_min_xp: LEVELS[LEVELS.length - 1].min_xp,
    levels: LEVELS,
    current_level_number: CURRENT_LEVEL_NUMBER,
    tasks_required: 3,
    tasks_done: CURRENT_XP >= nextLevel.min_xp ? 3 : 2,
    next_level_unlockable: CURRENT_XP >= nextLevel.min_xp,
  };
}

export function getCompetencyProfileMock() {
  const dimensions = PILLAR_DEFS.map((p, i) => ({
    key: p.key,
    name: p.name,
    score: Math.min(5, round1(2.6 + (i % 3) * 0.4)),
  }));
  const avg = round1(
    dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length,
  );
  return {
    dimensions,
    avg,
    current_level_number: CURRENT_LEVEL_NUMBER,
    target_level_number: CURRENT_LEVEL_NUMBER + 1,
    tier_number: 2,
    tier_name: "Practitioner",
    next_tier: { number: 3, name: "Expert", avg_needed: 4 },
  };
}

export function getRecommendationsMock() {
  return {
    level_number: CURRENT_LEVEL_NUMBER,
    role: "Digital Product Analyst",
    department: "Digital Transformation",
    items: [
      {
        id: 1,
        title: "Otomatisasi Laporan Mingguan",
        description: "Pakai AI untuk menyusun laporan dari data mentah.",
        category: "Operations",
        level_number: CURRENT_LEVEL_NUMBER,
      },
      {
        id: 2,
        title: "Ringkasan Notulen Rapat",
        description: "Ubah transkrip rapat jadi poin aksi.",
        category: "Human Capital",
        level_number: CURRENT_LEVEL_NUMBER,
      },
    ],
  };
}

export function getFirstWinMock() {
  return {
    first_win: {
      kind: "use_case" as const,
      name: "Otomatisasi Laporan Mingguan",
      hours_with_ai: 2,
      hours_without_ai: 6,
      submitted_at: daysAgo(20),
    },
  };
}

export function getStreakMock() {
  const pattern = [true, true, false, true, true, true, true];
  return {
    from: relativeDayStrip(pattern)[0].date,
    to: relativeDayStrip(pattern)[pattern.length - 1].date,
    days: relativeDayStrip(pattern).map((d) => ({
      date: d.date,
      count: d.value ? 1 : 0,
    })),
    current_streak: 4,
  };
}
