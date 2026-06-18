import OpenAI from "openai";
import {
  buildPreAssessmentReport,
  type PreAssessmentRecommendations,
  type PreAssessmentReportSource,
} from "@/lib/pre-assessment-report";

const MODEL = "gpt-5-mini";

let client: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["time_saved_label", "items"],
  properties: {
    time_saved_label: {
      type: "string",
      description:
        "Perkiraan total waktu yang bisa dihemat per minggu, format singkat seperti '~4,9 Jam/minggu'.",
    },
    items: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["source", "title", "impact", "speed", "description", "lessons"],
        properties: {
          source: {
            type: "string",
            description:
              "Tugas/rutinitas nyata milik user yang jadi dasar rekomendasi ini.",
          },
          title: {
            type: "string",
            description: "Judul use case AI yang konkret dan actionable.",
          },
          impact: {
            type: "string",
            enum: ["Tinggi", "Sedang", "Rendah"],
          },
          speed: {
            type: "string",
            description:
              "Estimasi percepatan, format '~70% lebih cepat' atau '~2 jam/minggu'.",
          },
          description: {
            type: "string",
            description: "1-2 kalimat penjelasan cara menerapkannya.",
          },
          lessons: {
            type: "array",
            minItems: 1,
            maxItems: 2,
            items: { type: "string" },
            description:
              "Nama chapter kurikulum (persis seperti yang diberikan) yang relevan.",
          },
        },
      },
    },
  },
} as const;

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

  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pre_assessment_recommendations",
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned an empty recommendations response.");
  }

  const parsed = JSON.parse(raw) as PreAssessmentRecommendations;
  if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new Error("OpenAI returned no recommendation items.");
  }
  return parsed;
}
