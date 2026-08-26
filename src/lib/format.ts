/* Score with exactly one decimal, e.g. 2.4 */
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

/** Compact IDR magnitude. Returns the scaled number plus a magnitude suffix */
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
