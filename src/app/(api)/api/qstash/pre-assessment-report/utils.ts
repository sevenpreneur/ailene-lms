import {
  buildPreAssessmentReport,
  type PreAssessmentRecommendations,
  type PreAssessmentReportSource,
} from "@/lib/pre-assessment-report";
import GetOpenAIClient, { OPENAI_MODELS } from "@/lib/openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const recommendationsResponseSchema = z.object({
  time_saved_label: z
    .string()
    .describe("Perkiraan total waktu hemat, contoh '~4,9 Jam/minggu'."),
  items: z
    .array(
      z.object({
        source: z
          .string()
          .describe("Tugas nyata user yang jadi dasar rekomendasi."),
        title: z.string().describe("Judul use case AI yang actionable."),
        impact: z.enum(["Tinggi", "Sedang", "Rendah"]),
        speed: z.string().describe("Estimasi percepatan atau waktu hemat."),
        description: z.string().describe("1-2 kalimat cara menerapkannya."),
        lessons: z.array(z.string()).min(1).max(2),
      })
    )
    .min(3)
    .max(5),
});

export type PreAssessmentAnswerContext = PreAssessmentReportSource & {
  use_cases: string[];
  training_expectation: string;
};

export async function generatePreAssessmentRecommendations(
  answers: PreAssessmentAnswerContext,
  availableLessons: string[]
): Promise<PreAssessmentRecommendations> {
  const report = buildPreAssessmentReport(answers);

  const pillarLines = report.pillars
    .map((p) => `- ${p.label}: ${p.score}/5`)
    .join("\n");

  const userContext = [
    `Skor pilar (skala 1-5):\n${pillarLines}`,
    `Rata-rata: ${report.avg}/5`,
    `Pilar terkuat: ${report.strongest.label}`,
    `Pilar terlemah: ${report.weakest.label}`,
    `Use case yang diminati: ${answers.use_cases.join(", ") || "-"}`,
    `Contoh penggunaan konkret: ${answers.concrete_example?.trim() || "-"}`,
    `Tantangan terbesar: ${answers.biggest_challenge || "-"}`,
    `Ekspektasi pelatihan: ${answers.training_expectation || "-"}`,
  ].join("\n");

  const lessonList = availableLessons.map((l) => `- ${l}`).join("\n");

  const systemPrompt = [
    "Kamu adalah AI learning advisor untuk program adopsi AI di lingkungan kerja.",
    "Tugasmu: dari hasil pre-assessment seorang karyawan, susun 3-5 rekomendasi use case AI yang paling berdampak untuk pekerjaan sehari-harinya.",
    "Aturan:",
    "- Bahasa Indonesia, ringkas, dan langsung bisa ditindaklanjuti.",
    "- Setiap rekomendasi harus berakar pada tugas/rutinitas nyata yang user sebutkan (field 'source').",
    "- Prioritaskan use case yang menutup pilar terlemah dan sesuai use case yang user minati.",
    "- Field 'lessons' WAJIB diambil persis dari daftar chapter yang tersedia, jangan mengarang nama lain.",
    "- 'time_saved_label' adalah perkiraan realistis total waktu hemat per minggu dari seluruh rekomendasi.",
  ].join("\n");

  const userPrompt = [
    "Daftar chapter kurikulum yang tersedia (pilih nama persis dari sini untuk 'lessons'):",
    lessonList,
    "",
    "Profil pre-assessment user:",
    userContext,
  ].join("\n");

  const completion = await GetOpenAIClient().chat.completions.parse({
    model: OPENAI_MODELS.GPT_5_MINI,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(
      recommendationsResponseSchema,
      "pre_assessment_recommendations"
    ),
  });

  const parsed = completion.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error("OpenAI returned an empty recommendations response.");
  }
  if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new Error("OpenAI returned no recommendation items.");
  }
  return parsed satisfies PreAssessmentRecommendations;
}
