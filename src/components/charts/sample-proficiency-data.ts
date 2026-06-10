// Local sample data for the proficiency trend chart — used ONLY as a fallback
// when the real query is essentially empty (org still all at Level 0), so the
// dashboard doesn't look broken during demos. As soon as members start leveling
// up, the component uses the real reconstructed data instead.
//
// Rising curve: org-average level (0..4) and cumulative % at Level 1+.
export type SampleProficiencyWeek = {
  label: string;
  avg_level: number;
  level1_plus_percent: number;
};

export const SAMPLE_PROFICIENCY: SampleProficiencyWeek[] = [
  { label: "Mgg 1", avg_level: 0.1, level1_plus_percent: 8 },
  { label: "Mgg 2", avg_level: 0.2, level1_plus_percent: 12 },
  { label: "Mgg 3", avg_level: 0.3, level1_plus_percent: 17 },
  { label: "Mgg 4", avg_level: 0.5, level1_plus_percent: 25 },
  { label: "Mgg 5", avg_level: 0.7, level1_plus_percent: 33 },
  { label: "Mgg 6", avg_level: 0.9, level1_plus_percent: 42 },
  { label: "Mgg 7", avg_level: 1.1, level1_plus_percent: 50 },
  { label: "Mgg 8", avg_level: 1.3, level1_plus_percent: 58 },
  { label: "Mgg 9", avg_level: 1.6, level1_plus_percent: 67 },
  { label: "Mgg 10", avg_level: 1.9, level1_plus_percent: 75 },
  { label: "Mgg 11", avg_level: 2.2, level1_plus_percent: 83 },
  { label: "Mgg 12", avg_level: 2.5, level1_plus_percent: 92 },
];
