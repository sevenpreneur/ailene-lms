// Shared color language for the Sponsor / Executive dashboard charts.
//
// All data-viz colors are driven by the shadcn preset chart tokens
// (--chart-1..5, light → dark) so the dashboard is themed from a single source:
// changing the preset in globals.css re-themes every chart automatically. The
// KPI accent / activity timeline uses --destructive (the preset's identity red).
//
// These resolve as CSS custom properties at render time. recharts renders SVG,
// so `fill`/`stroke`/`backgroundColor` accept `var(--chart-N)` directly.

// Level palette — one distinct hue per tier so the distribution donut reads as
// real categories instead of a single blue wash, adding color life to the exec
// view. Order follows the growth journey: neutral start → cool → vivid as the
// level rises (L0 slate → L4 amber).
export const GROWTH_RAMP = [
  "#94a3b8", // L0 Assessment — slate
  "#38bdf8", // L1 AI Foundation — sky
  "#8b5cf6", // L2 AI Operator — violet
  "#10b981", // L3 AI Intermediate — emerald
  "#f59e0b", // L4 AI Advanced — amber
];

// Single bars: muted (light) for context periods, deep for the highlighted
// (most recent) period so the latest result pops without a second legend.
export const BAR_SOFT = "var(--chart-1)";
export const BAR_DEEP = "var(--chart-3)";

// Secondary overlay line (adoption %) — emerald so it reads as a distinct
// second series against the blue bars (two-tone, not blue-on-blue).
export const LINE_ADOPTION = "#10b981";
