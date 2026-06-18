export type PreAssessmentReportTone = "green" | "yellow";

export type PreAssessmentReportPillar = {
  key:
    | "ai_foundation"
    | "prompting"
    | "tool_fluency"
    | "use_case_diversity"
    | "ai_habit"
    | "agentic";
  label: string;
  score: number;
  tone: PreAssessmentReportTone;
};

export type PreAssessmentReportSource = {
  ai_use_frequency: string;
  ai_tools_used: string[];
  ai_limitations: string[];
  output_review: string;
  use_cases: string[];
  team_adoption: string;
  concrete_example: string | null;
  model_selection: string;
  multimodal_use: string;
  workflow_reuse: string;
  prompt_comfort: string;
  prompt_iteration: string;
  refine_scenario: string;
  professional_attitude: string;
  data_safety_check: string;
  publish_unchecked: string;
  biggest_challenge: string;
};

const round1 = (value: number) => Math.round(value * 10) / 10;
const clampScore = (value: number) => Math.max(1, Math.min(5, value));
const avgScore = (values: number[]) =>
  clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);

const frequencyScore: Record<string, number> = {
  NEVER: 1,
  RARELY: 1.7,
  SOMETIMES: 2.5,
  OFTEN: 3.3,
  ALWAYS: 4.1,
};

const aiUseFrequencyScore: Record<string, number> = {
  NEVER: 1,
  TRIED: 1.6,
  WEEKLY: 2.4,
  DAILY: 3.3,
  INTENSIVE: 4.1,
};

const outputReviewScore: Record<string, number> = {
  NO_CHECK: 1,
  SOMETIMES: 2,
  ALWAYS: 3.3,
  CROSS_CHECK: 4.2,
  NO_USE: 1,
};

const teamAdoptionScore: Record<string, number> = {
  NONE: 1,
  PERSONAL: 1.8,
  PILOT: 2.6,
  POLICY: 3.4,
  INTEGRATED: 4.2,
};

const promptSkillScore: Record<string, number> = {
  NONE: 1,
  BASIC: 1.8,
  DECENT: 2.6,
  STRUCTURED: 3.5,
  EXPERT: 4.3,
};

const refineScenarioScore: Record<string, number> = {
  TARGETED: 4.2,
  MANUAL: 3.2,
  SWITCH_TOOL: 2.4,
  RESTART: 1.8,
};

const professionalAttitudeScore: Record<string, number> = {
  TOO_RISKY: 1,
  CAUTIOUS: 2.7,
  NEUTRAL: 2.2,
  SUPPORTIVE: 3.4,
  ESSENTIAL: 3.8,
};

const safeScore = (map: Record<string, number>, key: string) => map[key] ?? 1;
const reverseFrequencyScore = (key: string) =>
  clampScore(5 - safeScore(frequencyScore, key));

function listBreadthScore(values: string[], emptyNeedle: string): number {
  const realValues = values.filter(
    (value) => !value.toLowerCase().includes(emptyNeedle)
  );
  if (realValues.length === 0) return 1;
  return clampScore(1 + realValues.length * 0.45);
}

export function buildPreAssessmentReport(source: PreAssessmentReportSource) {
  const limitationScore = listBreadthScore(source.ai_limitations, "belum tahu");
  const toolBreadthScore = listBreadthScore(source.ai_tools_used, "belum pernah");
  const useCaseDiversityScore = clampScore(
    1 + source.use_cases.length * 0.3 + (source.concrete_example ? 0.3 : 0)
  );

  const rawPillarInputs: Omit<PreAssessmentReportPillar, "tone">[] = [
    {
      key: "ai_foundation",
      label: "AI Foundation",
      score: avgScore([
        limitationScore,
        safeScore(outputReviewScore, source.output_review),
        safeScore(professionalAttitudeScore, source.professional_attitude),
        safeScore(frequencyScore, source.data_safety_check),
        reverseFrequencyScore(source.publish_unchecked),
      ]),
    },
    {
      key: "prompting",
      label: "Prompting",
      score: avgScore([
        safeScore(promptSkillScore, source.prompt_comfort),
        safeScore(frequencyScore, source.prompt_iteration),
        safeScore(refineScenarioScore, source.refine_scenario),
      ]),
    },
    {
      key: "tool_fluency",
      label: "Tool Fluency",
      score: avgScore([
        safeScore(aiUseFrequencyScore, source.ai_use_frequency),
        toolBreadthScore,
        safeScore(frequencyScore, source.model_selection),
        safeScore(frequencyScore, source.multimodal_use),
      ]),
    },
    {
      key: "use_case_diversity",
      label: "Use Case",
      score: useCaseDiversityScore,
    },
    {
      key: "ai_habit",
      label: "AI Habit",
      score: avgScore([
        safeScore(aiUseFrequencyScore, source.ai_use_frequency),
        safeScore(frequencyScore, source.workflow_reuse),
        safeScore(teamAdoptionScore, source.team_adoption),
        safeScore(frequencyScore, source.data_safety_check),
      ]),
    },
    {
      key: "agentic",
      label: "Agentic",
      score: avgScore([
        safeScore(frequencyScore, source.workflow_reuse),
        safeScore(frequencyScore, source.model_selection),
        safeScore(frequencyScore, source.multimodal_use),
        safeScore(teamAdoptionScore, source.team_adoption),
      ]),
    },
  ];
  const rawPillars = rawPillarInputs.map((pillar) => ({
    ...pillar,
    score: round1(pillar.score),
  }));

  const pillars: PreAssessmentReportPillar[] = rawPillars.map((pillar) => ({
    ...pillar,
    tone: pillar.score >= 3.2 ? "green" : "yellow",
  }));
  const avg = round1(
    pillars.reduce((sum, pillar) => sum + pillar.score, 0) / pillars.length
  );
  const strongest = pillars.reduce((best, pillar) =>
    pillar.score > best.score ? pillar : best
  );
  const weakest = pillars.reduce((worst, pillar) =>
    pillar.score < worst.score ? pillar : worst
  );

  return {
    pillars,
    avg,
    strongest: { key: strongest.key, label: strongest.label },
    weakest: { key: weakest.key, label: weakest.label },
    quote:
      source.concrete_example?.trim() ||
      source.biggest_challenge ||
      "Tiap akhir bulan saya merangkum sekitar 30 exit interview jadi satu laporan untuk manajer, biasanya makan waktu hampir seharian.",
  };
}
