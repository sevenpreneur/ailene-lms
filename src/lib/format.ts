// Number formatting helpers shared across the program dashboards.
// Centralized here so the id-ID locale + fraction rules stay consistent across
// the executive view, pre-assessment, group detail, level distribution, and
// outcome reports (previously each page redefined its own copy).

/** Score with exactly one decimal, e.g. 2.4 (avg level, pillar score). */
export function formatScore(n: number): string {
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Number with up to one decimal, e.g. 1.234,5 (hours saved, counts). */
export function formatDecimal(n: number): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

/** Plain integer with id-ID grouping, e.g. 1.234. */
export function formatInt(n: number): string {
  return n.toLocaleString("id-ID");
}

/**
 * Compact IDR magnitude. Returns the scaled number plus a magnitude suffix
 * ("M" = miliar, "jt" = juta, "" = under a million). Callers compose the
 * currency wording themselves (e.g. `${suffix} Rp` or `Rp ${value}`) so the
 * helper stays presentation-agnostic.
 */
export function formatCompactIdr(value: number): {
  value: string;
  suffix: "M" | "jt" | "";
} {
  if (value >= 1_000_000_000) {
    return {
      value: (value / 1_000_000_000).toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      }),
      suffix: "M",
    };
  }
  if (value >= 1_000_000) {
    return {
      value: (value / 1_000_000).toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      }),
      suffix: "jt",
    };
  }
  return { value: value.toLocaleString("id-ID"), suffix: "" };
}
