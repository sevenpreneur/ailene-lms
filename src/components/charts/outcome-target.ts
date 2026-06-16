// Shared target-level logic for the Sponsor outcome report. The program wants
// employees to reach at least TARGET_LEVEL; the process line and result donut
// both derive their numbers from the same level distribution.

/** Level the program wants employees to reach (≥). Adjust to the real goal. */
export const TARGET_LEVEL = 2;

// Deterministic sample shape for the "process" line (rising), 30 points 0..1.
// Used only for the illustrative trend until a real time-series endpoint exists.
export const PROCESS_CURVE = [
  0.16, 0.2, 0.18, 0.24, 0.27, 0.25, 0.31, 0.34, 0.32, 0.37, 0.41, 0.39, 0.44,
  0.48, 0.46, 0.51, 0.55, 0.53, 0.58, 0.62, 0.6, 0.66, 0.7, 0.68, 0.74, 0.79,
  0.82, 0.87, 0.93, 1,
];

export type LevelDist = {
  level_number: number;
  code: string;
  name: string;
  count: number;
  percent: number;
}[];

export function targetLevelName(data?: { distribution: LevelDist }) {
  const name = data?.distribution.find(
    (d) => d.level_number === TARGET_LEVEL
  )?.name;
  return name ? `≥ L${TARGET_LEVEL} ${name}` : `≥ L${TARGET_LEVEL}`;
}

export function deriveTarget(distribution: LevelDist) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0) || 1;
  const reached = distribution
    .filter((d) => d.level_number >= TARGET_LEVEL)
    .reduce((sum, d) => sum + d.count, 0);
  const below = Math.max(total - reached, 0);
  const currentPct = Math.round((reached / total) * 100);
  return { total, reached, below, currentPct };
}
