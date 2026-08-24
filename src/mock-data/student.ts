// Student-facing mock data — today-focus, learning path, skill-practice,
// quizzes, my-progress, and pre-assessment (student view).

import { buildPreAssessmentReport } from "@/lib/pre-assessment-report";
import {
  CATEGORIES,
  CHAPTERS,
  GROUPS,
  LEVELS,
  MEMBER_ROSTER,
  PILLAR_DEFS,
  levelByNumber,
} from "./shared";
import { daysAgo, daysFromNow, relativeDayStrip, round1 } from "./utils";

// The signed-in student is L3 (Advanced Practitioner), 1050 XP — matches
// shared.ts's getAilMemberMock so every widget tells the same story.
const CURRENT_LEVEL_NUMBER = 3;
const CURRENT_XP = 1050;

export function getChaptersProgressMock() {
  return CHAPTERS.map((ch) => {
    const unlocked = ch.level.level_number <= CURRENT_LEVEL_NUMBER;
    const completed = ch.level.level_number < CURRENT_LEVEL_NUMBER;
    const progress: "not_started" | "in_progress" | "completed" = !unlocked
      ? "not_started"
      : completed
        ? "completed"
        : "in_progress";
    const totalTasks = 3;
    const doneTasks = progress === "completed" ? 3 : progress === "in_progress" ? 1 : 0;
    return { ...ch, progress, done_tasks: doneTasks, total_tasks: totalTasks };
  });
}

type QuizMock = {
  id: string;
  chapter_id: number;
  name: string;
  description: string;
  order_index: number;
  questions: {
    id: number;
    question: string;
    explanation: string | null;
    xp_reward: number;
    options: { id: number; option_code: string; text: string; is_correct: boolean }[];
  }[];
};

const QUIZZES: QuizMock[] = CHAPTERS.map((ch, i) => ({
  id: `quiz-${ch.id}`,
  chapter_id: ch.id,
  name: `Quiz: ${ch.name}`,
  description: `Uji pemahamanmu tentang ${ch.name.toLowerCase()}.`,
  order_index: 1,
  questions: [
    {
      id: i * 10 + 1,
      question: "Apa manfaat utama menggunakan AI untuk pekerjaan sehari-hari?",
      explanation: "AI membantu mempercepat tugas repetitif dan memberi insight lebih cepat.",
      xp_reward: 20,
      options: [
        { id: i * 100 + 1, option_code: "A", text: "Menghemat waktu pengerjaan", is_correct: true },
        { id: i * 100 + 2, option_code: "B", text: "Menggantikan seluruh pekerjaan manusia", is_correct: false },
        { id: i * 100 + 3, option_code: "C", text: "Tidak ada manfaat signifikan", is_correct: false },
      ],
    },
    {
      id: i * 10 + 2,
      question: "Prompt yang baik sebaiknya mencantumkan apa?",
      explanation: "Konteks dan hasil yang diharapkan bikin output AI lebih relevan.",
      xp_reward: 20,
      options: [
        { id: i * 100 + 4, option_code: "A", text: "Konteks dan format output yang diinginkan", is_correct: true },
        { id: i * 100 + 5, option_code: "B", text: "Sesingkat mungkin tanpa detail", is_correct: false },
      ],
    },
  ],
}));

const VIDEOS = CHAPTERS.map((ch) => ({
  id: ch.id,
  chapter_id: ch.id,
  title: `Video: ${ch.name}`,
  description: `Rekaman sesi live untuk ${ch.name}.`,
  video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  xp_reward: 15,
  order_index: 1,
}));

const MATERIALS = CHAPTERS.flatMap((ch) => [
  {
    id: `mat-${ch.id}-1`,
    chapter_id: ch.id,
    title: `Ringkasan Materi: ${ch.name}`,
    description: "Rangkuman poin-poin penting dari sesi.",
    content: `# ${ch.name}\n\nIni adalah ringkasan materi untuk chapter "${ch.name}". Konten lengkap akan tersedia setelah integrasi backend Java.`,
    file_url: null as string | null,
    image_url: null as string | null,
    xp_reward: 10,
    order_index: 1,
  },
]);

export function getTasksMock(input: { chapter_id: number }) {
  return {
    quizzes: QUIZZES.filter((q) => q.chapter_id === input.chapter_id).map((q) => ({
      id: q.id,
      name: q.name,
      description: q.description,
      order_index: q.order_index,
      question_count: q.questions.length,
      xp_reward: q.questions.reduce((s, x) => s + x.xp_reward, 0),
      xp_earned: 0,
      best_score: null as number | null,
      attempts: 0,
    })),
    videos: VIDEOS.filter((v) => v.chapter_id === input.chapter_id).map((v) => ({
      ...v,
      xp_earned: 0,
      completed: false,
    })),
    materials: MATERIALS.filter((m) => m.chapter_id === input.chapter_id).map((m) => ({
      ...m,
      xp_earned: 0,
      completed: false,
    })),
  };
}

export function getQuizQuestionsMock(input: { quiz_id: string }) {
  const quiz = QUIZZES.find((q) => q.id === input.quiz_id);
  if (!quiz) return null;
  const chapter = CHAPTERS.find((c) => c.id === quiz.chapter_id)!;
  return {
    quiz: { id: quiz.id, name: quiz.name, description: quiz.description, chapter: { id: chapter.id, name: chapter.name } },
    questions: quiz.questions,
    progress: null as {
      attempt_number: number;
      score: number;
      answers: Record<string, string>;
      submitted_at: Date;
    } | null,
    draft: null as { attempt_number: number; answers: Record<string, string>; started_at: Date; updated_at: Date } | null,
    xp_earned: 0,
  };
}

export function getQuizResultMock(input: { quiz_id: string }) {
  const quiz = QUIZZES.find((q) => q.id === input.quiz_id);
  if (!quiz) return null;
  const chapter = CHAPTERS.find((c) => c.id === quiz.chapter_id)!;
  const answers: Record<string, string> = {};
  for (const q of quiz.questions) {
    const correct = q.options.find((o) => o.is_correct);
    if (correct) answers[String(q.id)] = correct.option_code;
  }
  return {
    quiz: { id: quiz.id, name: quiz.name, description: quiz.description, chapter: { id: chapter.id, name: chapter.name } },
    questions: quiz.questions,
    submission: { attempt_number: 1, score: 90, answers, submitted_at: daysAgo(3) },
    xp_earned: quiz.questions.reduce((s, x) => s + x.xp_reward, 0),
  };
}

export function getMaterialDetailMock(input: { material_id: string }) {
  const material = MATERIALS.find((m) => m.id === input.material_id);
  if (!material) return null;
  const chapter = CHAPTERS.find((c) => c.id === material.chapter_id)!;
  return {
    material: { ...material, chapter: { id: chapter.id, name: chapter.name }, created_at: daysAgo(30), updated_at: daysAgo(10) },
    completed: false,
    completed_at: null as Date | null,
    xp_earned: 0,
  };
}

export function getLevelMaterialsMock(input: { material_id: string }) {
  const material = MATERIALS.find((m) => m.id === input.material_id);
  const chapter = material ? CHAPTERS.find((c) => c.id === material.chapter_id) : undefined;
  const levelNumber = chapter?.level.level_number ?? 1;
  const siblings = MATERIALS.filter(
    (m) => CHAPTERS.find((c) => c.id === m.chapter_id)?.level.level_number === levelNumber
  );
  return {
    level_number: levelNumber,
    materials: siblings.map((m, i) => ({
      id: m.id,
      title: m.title,
      index: i + 1,
      completed: false,
      locked: false,
      is_current: m.id === input.material_id,
    })),
  };
}

export function getAssignedPromptsMock() {
  return [
    {
      id: 1,
      prompt: {
        id: 3,
        name: "Draft Kebijakan Internal",
        scenario: "Susun draft kebijakan WFH berdasarkan poin-poin diskusi.",
        expected_output: "Draft kebijakan siap review, format formal.",
        xp_reward: 30,
        level: levelByNumber(3),
        categories: [CATEGORIES[0]],
      },
      assigned_by: { id: 101, full_name: "Andra Wicaksono", avatar: null },
      deadline: daysFromNow(3),
      message: "Tolong selesaikan sebelum sprint review.",
      submitted_at: null as Date | null,
      reviewed_at: null as Date | null,
      comment: null as string | null,
      is_accepted: false,
    },
  ];
}

export function getAssignedUseCasesMock() {
  return [
    {
      id: 1,
      use_case: {
        id: 2,
        name: "Chatbot FAQ Internal",
        description: "Bangun prototipe chatbot untuk menjawab pertanyaan HR umum.",
        xp_reward: 35,
        level: levelByNumber(3),
        categories: [CATEGORIES[0], CATEGORIES[4]],
      },
      assigned_by: { id: 101, full_name: "Andra Wicaksono", avatar: null },
      deadline: daysFromNow(5),
      message: null as string | null,
      submitted_at: null as Date | null,
      reviewed_at: null as Date | null,
      comment: null as string | null,
      is_accepted: false,
    },
  ];
}

export function getMemberPromptLibraryMock() {
  return [
    {
      id: 1,
      name: "Ringkasan Notulen Rapat",
      scenario: "Ubah transkrip rapat panjang jadi ringkasan poin aksi.",
      expected_output: "Daftar poin aksi dengan PIC dan deadline.",
      level: levelByNumber(1),
      categories: [CATEGORIES[0]],
      created_at: daysAgo(40),
      submission: { id: 10, deadline: null as Date | null, submitted_at: daysAgo(35), reviewed_at: daysAgo(33), is_accepted: true },
    },
    {
      id: 2,
      name: "Analisis Data Penjualan",
      scenario: "Minta AI membaca tabel penjualan dan menemukan tren utama.",
      expected_output: "3-5 insight tren beserta rekomendasi tindak lanjut.",
      level: levelByNumber(2),
      categories: [CATEGORIES[3]],
      created_at: daysAgo(35),
      submission: null as { id: number; deadline: Date | null; submitted_at: Date | null; reviewed_at: Date | null; is_accepted: boolean } | null,
    },
  ];
}

export function getMemberUseCaseLibraryMock() {
  return [
    {
      id: 1,
      name: "Otomatisasi Laporan Mingguan",
      description: "Pakai AI untuk menyusun laporan mingguan dari data mentah.",
      level: levelByNumber(2),
      categories: [CATEGORIES[2]],
      created_at: daysAgo(38),
      submission: { id: 11, deadline: null as Date | null, submitted_at: daysAgo(20), reviewed_at: daysAgo(18), is_accepted: true },
    },
  ];
}

export function getPracticeSubmissionsMock() {
  return [
    {
      id: 10,
      kind: "PROMPT" as const,
      ref_id: 1,
      title: "Ringkasan Notulen Rapat",
      body: "Ubah transkrip rapat panjang jadi ringkasan poin aksi.",
      level: levelByNumber(1),
      categories: [CATEGORIES[0]],
      assigned_by: null as { id: number; full_name: string; avatar: string | null } | null,
      reviewed_by: { id: 101, full_name: "Andra Wicaksono", avatar: null },
      deadline: null as Date | null,
      message: null as string | null,
      submitted_at: daysAgo(35),
      reviewed_at: daysAgo(33),
      comment: "Sudah bagus, poin aksinya jelas.",
      is_accepted: true,
    },
    {
      id: 11,
      kind: "USE_CASE" as const,
      ref_id: 1,
      title: "Otomatisasi Laporan Mingguan",
      body: "Pakai AI untuk menyusun laporan mingguan dari data mentah.",
      level: levelByNumber(2),
      categories: [CATEGORIES[2]],
      assigned_by: null as { id: number; full_name: string; avatar: string | null } | null,
      reviewed_by: { id: 101, full_name: "Andra Wicaksono", avatar: null },
      deadline: null as Date | null,
      message: null as string | null,
      submitted_at: daysAgo(20),
      reviewed_at: daysAgo(18),
      comment: "Hemat waktu signifikan, lanjutkan.",
      is_accepted: true,
    },
  ];
}

export function getPromptAssignmentMock(input: { prompt_id: number }) {
  const assigned = getAssignedPromptsMock().find((a) => a.prompt.id === input.prompt_id);
  if (assigned) {
    return { id: assigned.id, prompt: assigned.prompt, assigned_by: assigned.assigned_by, reviewed_by: null, deadline: assigned.deadline, message: assigned.message, input: "", output: "", submitted_at: null, reviewed_at: null, comment: null, is_accepted: false };
  }
  return {
    id: 99,
    prompt: { id: input.prompt_id, name: "Ringkasan Notulen Rapat", scenario: "Ubah transkrip rapat panjang jadi ringkasan poin aksi.", expected_output: "Daftar poin aksi.", level: levelByNumber(1), categories: [CATEGORIES[0]] },
    assigned_by: null,
    reviewed_by: null,
    deadline: null as Date | null,
    message: null as string | null,
    input: "",
    output: "",
    submitted_at: null as Date | null,
    reviewed_at: null as Date | null,
    comment: null as string | null,
    is_accepted: false,
  };
}

export function getUseCaseAssignmentMock(input: { use_case_id: number }) {
  const assigned = getAssignedUseCasesMock().find((a) => a.use_case.id === input.use_case_id);
  if (assigned) {
    return { id: assigned.id, use_case: assigned.use_case, assigned_by: assigned.assigned_by, reviewed_by: null, deadline: assigned.deadline, message: assigned.message, outcome_proof: null, hours_with_ai: null, hours_without_ai: null, description: "", ai_tool: "", frequency: null, type: null, submitted_at: null, reviewed_at: null, comment: null, is_accepted: false };
  }
  return {
    id: 98,
    use_case: { id: input.use_case_id, name: "Otomatisasi Laporan Mingguan", description: "Pakai AI untuk menyusun laporan mingguan.", level: levelByNumber(2), categories: [CATEGORIES[2]] },
    assigned_by: null,
    reviewed_by: null,
    deadline: null as Date | null,
    message: null as string | null,
    outcome_proof: null as string | null,
    hours_with_ai: null as number | null,
    hours_without_ai: null as number | null,
    description: "",
    ai_tool: "",
    frequency: null as string | null,
    type: null as string | null,
    submitted_at: null as Date | null,
    reviewed_at: null as Date | null,
    comment: null as string | null,
    is_accepted: false,
  };
}

type FocusKind = "Quiz" | "Video" | "Material" | "PromptPractice" | "UseCasePractice";

export function getTodayFocusMock() {
  const chapter = CHAPTERS[2]; // in-progress chapter (L3)
  return {
    kind: "Material" as FocusKind,
    task_id: MATERIALS[2].id,
    task_title: MATERIALS[2].title,
    chapter_id: chapter.id,
    chapter_name: chapter.name,
    level_id: chapter.level_id,
    level_number: chapter.level.level_number,
    category: null as string | null,
    assigned_by_name: null as string | null,
    deadline: undefined as Date | undefined,
    href: `/student/materials/${MATERIALS[2].id}`,
  };
}

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
  const avg = round1(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
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
      { id: 1, title: "Otomatisasi Laporan Mingguan", description: "Pakai AI untuk menyusun laporan dari data mentah.", category: "Operations", level_number: CURRENT_LEVEL_NUMBER },
      { id: 2, title: "Ringkasan Notulen Rapat", description: "Ubah transkrip rapat jadi poin aksi.", category: "Human Capital", level_number: CURRENT_LEVEL_NUMBER },
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

export function getAchievementsMock() {
  return {
    use_case_count: 1,
    prompt_count: 1,
    hours_saved_total: 4,
    tools_mastered: ["ChatGPT", "Claude"],
  };
}

export function getStreakMock() {
  const pattern = [true, true, false, true, true, true, true];
  return {
    from: relativeDayStrip(pattern)[0].date,
    to: relativeDayStrip(pattern)[pattern.length - 1].date,
    days: relativeDayStrip(pattern).map((d) => ({ date: d.date, count: d.value ? 1 : 0 })),
    current_streak: 4,
  };
}

const PRE_ASSESSMENT_MOCK = {
  id: 1,
  ai_use_frequency: "DAILY",
  ai_tools_used: ["ChatGPT", "Claude"],
  ai_limitations: ["Kadang jawaban kurang akurat untuk data internal"],
  output_review: "ALWAYS",
  use_cases: ["Ringkasan rapat", "Analisis data penjualan"],
  team_adoption: "PILOT",
  concrete_example:
    "Tiap akhir bulan saya merangkum sekitar 30 exit interview jadi satu laporan untuk manajer, biasanya makan waktu hampir seharian.",
  model_selection: "SOMETIMES",
  multimodal_use: "RARELY",
  workflow_reuse: "OFTEN",
  prompt_comfort: "DECENT",
  prompt_iteration: "OFTEN",
  refine_scenario: "MANUAL",
  professional_attitude: "SUPPORTIVE",
  data_safety_check: "OFTEN",
  publish_unchecked: "RARELY",
  biggest_challenge: "Menyusun prompt yang konsisten untuk laporan berulang.",
  submitted_at: daysAgo(14),
};

export function getPreAssessmentMineMock() {
  return PRE_ASSESSMENT_MOCK;
}

export function getPreAssessmentReportMock() {
  return {
    pre_assessment: PRE_ASSESSMENT_MOCK,
    report: buildPreAssessmentReport(PRE_ASSESSMENT_MOCK),
  };
}

type PreAssessmentRecStatus = "pending" | "processing" | "completed" | "failed";

export function getPreAssessmentRecommendationsMock() {
  const status: PreAssessmentRecStatus = "completed";
  return {
    status: status as PreAssessmentRecStatus,
    recommendations: {
      time_saved_label: "~4,9 Jam/minggu",
      items: [
        {
          source: "Merangkum notulen rapat dan exit interview",
          title: "Otomatisasi ringkasan rapat & interview",
          impact: "Tinggi",
          speed: "~70% lebih cepat",
          description: "Gunakan AI untuk merangkum transkrip panjang jadi poin aksi siap kirim.",
          lessons: ["Pengenalan AI & Prompting Dasar", "AI untuk Produktivitas Kerja"],
        },
        {
          source: "Analisis data penjualan mingguan",
          title: "Dashboard insight otomatis",
          impact: "Sedang",
          speed: "~50% lebih cepat",
          description: "Minta AI membaca tabel data dan menyorot tren utama tiap minggu.",
          lessons: ["AI untuk Produktivitas Kerja"],
        },
      ],
    },
    error_message: null as string | null,
    generated_at: daysAgo(13),
  };
}

export function getCoachingNotesReceivedMock() {
  return [
    {
      id: 1,
      text: "Progress kamu bagus minggu ini, terus konsisten praktik use case-nya ya.",
      created_at: daysAgo(4),
      champion: { id: 101, role: "CHAMPION", full_name: "Andra Wicaksono", avatar: null as string | null },
    },
  ];
}

export function getGroupLeaderboardMock() {
  const group = GROUPS[0];
  const members = MEMBER_ROSTER.filter((m) => m.group_id === group.id)
    .slice()
    .sort((a, b) => b.total_xp - a.total_xp);
  const leaderboard = members.map((m, i) => ({
    rank: i + 1,
    member_id: m.member_id,
    full_name: m.user.full_name,
    avatar: m.user.avatar,
    total_xp: m.total_xp,
    is_me: m.member_id === 1,
  }));
  return {
    group: { id: group.id, name: group.name },
    my_rank: leaderboard.find((l) => l.is_me)?.rank ?? 1,
    total: leaderboard.length,
    leaderboard,
  };
}
