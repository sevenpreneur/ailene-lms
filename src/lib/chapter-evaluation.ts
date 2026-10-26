import type {
  ChapterTestKind,
  ChapterTestLockedReason,
} from "@/apis/chapter-tests";

// Matches the backend limits for essays and each survey text answer.
export const CHAPTER_TEST_ESSAY_MAX = 5000;
export const CHAPTER_SURVEY_TEXT_MAX = 2000;

export const CHAPTER_TEST_KIND_LABEL: Record<ChapterTestKind, string> = {
  pre_test: "Pre-test",
  post_test: "Post-test",
};

export const CHAPTER_TEST_LOCKED_MESSAGE: Record<
  ChapterTestLockedReason,
  string
> = {
  pre_test_required: "Kerjakan pre-test chapter ini dulu",
  materials_incomplete: "Baca semua materi, sebelum memulai post-test",
  post_test_submitted: "Pre-test ditutup karena post-test sudah dikirim",
  test_locked: "Tes ini belum dibuka oleh admin",
};

export type ChapterSurveyRatingKey =
  | "trainer_clarity"
  | "trainer_mastery"
  | "trainer_responsiveness"
  | "trainer_engagement"
  | "material_relevance"
  | "material_flow"
  | "material_depth"
  | "learning_value";

export type ChapterSurveyTextKey =
  | "favorite_material"
  | "missing_topics"
  | "disliked_material"
  | "improvement_suggestion";

export const CHAPTER_SURVEY_SECTIONS: {
  title: string;
  description: string;
  ratings?: { key: ChapterSurveyRatingKey; question: string }[];
  texts?: {
    key: ChapterSurveyTextKey;
    question: string;
    placeholder: string;
  }[];
}[] = [
  {
    title: "Tentang Trainer",
    description: "Nilai sesi yang dibawakan trainer.",
    ratings: [
      {
        key: "trainer_clarity",
        question: "Seberapa jelas penjelasan trainer?",
      },
      {
        key: "trainer_mastery",
        question: "Seberapa baik trainer menguasai materi?",
      },
      {
        key: "trainer_responsiveness",
        question: "Seberapa responsif trainer menjawab pertanyaan?",
      },
      {
        key: "trainer_engagement",
        question: "Seberapa interaktif sesi bersama trainer?",
      },
    ],
  },
  {
    title: "Tentang Materi",
    description: "Nilai kualitas materi chapter ini.",
    ratings: [
      {
        key: "material_relevance",
        question: "Seberapa relevan materi dengan pekerjaanmu?",
      },
      {
        key: "material_flow",
        question: "Seberapa baik alur penyampaian materi?",
      },
      {
        key: "material_depth",
        question: "Seberapa mendalam materi yang disampaikan?",
      },
      {
        key: "learning_value",
        question: "Seberapa bermanfaat sesi ini untukmu?",
      },
    ],
  },
  {
    title: "Feedback Tambahan",
    description: "Jawaban berikut boleh dikosongkan.",
    texts: [
      {
        key: "favorite_material",
        question: "Apa bagian yang paling kamu sukai?",
        placeholder: "Ceritakan bagian yang paling bermanfaat...",
      },
      {
        key: "missing_topics",
        question: "Topik apa yang perlu ditambahkan?",
        placeholder: "Misalnya studi kasus atau latihan praktik...",
      },
      {
        key: "disliked_material",
        question: "Bagian mana yang perlu diperbaiki?",
        placeholder: "Ceritakan bagian yang kurang sesuai...",
      },
      {
        key: "improvement_suggestion",
        question: "Ada saran lain untuk sesi berikutnya?",
        placeholder: "Tulis saranmu di sini...",
      },
    ],
  },
];

export const CHAPTER_SURVEY_RATING_KEYS = CHAPTER_SURVEY_SECTIONS.flatMap(
  (section) => section.ratings?.map((field) => field.key) ?? [],
);
export const CHAPTER_SURVEY_TEXT_KEYS = CHAPTER_SURVEY_SECTIONS.flatMap(
  (section) => section.texts?.map((field) => field.key) ?? [],
);
