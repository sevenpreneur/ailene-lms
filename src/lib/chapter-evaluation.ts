import type {
  ChapterTestKind,
  ChapterTestLockedReason,
} from "@/apis/chapter-tests";

// Matches the backend's 5000-char cap on essay answers and 2000-char cap on survey comments.
export const CHAPTER_TEST_ESSAY_MAX = 5000;
export const CHAPTER_SURVEY_COMMENT_MAX = 2000;

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
};

export type ChapterSurveyRatingKey =
  | "satisfaction"
  | "relevance"
  | "trainer_rating";

export const CHAPTER_SURVEY_QUESTIONS: {
  key: ChapterSurveyRatingKey;
  question: string;
  low: string;
  high: string;
}[] = [
  {
    key: "satisfaction",
    question: "Secara keseluruhan, seberapa puas kamu dengan chapter ini?",
    low: "Sangat tidak puas",
    high: "Sangat puas",
  },
  {
    key: "relevance",
    question:
      "Seberapa relevan materi chapter ini dengan pekerjaanmu sehari-hari?",
    low: "Tidak relevan",
    high: "Sangat relevan",
  },
  {
    key: "trainer_rating",
    question: "Seberapa baik trainer menyampaikan sesi chapter ini?",
    low: "Kurang baik",
    high: "Sangat baik",
  },
];
