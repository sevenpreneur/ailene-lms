import type { PreAssessmentSection } from "@/apis/pre-assessment";

// Matches the backend's 4000-char cap on text answers.
export const PRE_ASSESSMENT_TEXT_MAX = 4000;

export const PRE_ASSESSMENT_SECTIONS: Record<
  PreAssessmentSection,
  { label: string; hint: string; badge: string }
> = {
  profile: {
    label: "Profil",
    hint: "Pilih yang paling menggambarkan kondisimu sekarang.",
    badge:
      "bg-gray-100 text-gray-700 dark:bg-dashboard-border dark:text-gray-300",
  },
  scenario: {
    label: "Skenario",
    hint: "Pilih satu tindakan yang paling tepat.",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  practice: {
    label: "Praktik",
    hint: "Tulis selengkap yang kamu bisa. Jawaban ini dinilai oleh AI.",
    badge:
      "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright",
  },
  behaviour: {
    label: "Kebiasaan",
    hint: "Jawab sesuai yang benar-benar kamu lakukan sebulan terakhir.",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
};

// Presentation only: a 0-100 score's colour band.
export function scoreTone(score: number): "high" | "mid" | "low" {
  if (score >= 70) return "high";
  if (score >= 50) return "mid";
  return "low";
}
