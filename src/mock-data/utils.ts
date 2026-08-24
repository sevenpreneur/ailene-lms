import dayjs from "dayjs";

// Kept in sync with the old readOutcome/executiveView constant — one hour
// saved is valued at this many Rupiah for ROI figures across the mock data.
export const ROI_VALUE_PER_HOUR = 250_000;

export function daysAgo(n: number): Date {
  return dayjs().subtract(n, "day").toDate();
}

export function daysFromNow(n: number): Date {
  return dayjs().add(n, "day").toDate();
}

// Deterministic day-strip generator (e.g. streak calendars) — pattern is a
// fixed array of booleans, only the date anchor moves with "today".
export function relativeDayStrip<T>(
  pattern: T[],
  todayIndex = pattern.length - 1
): { date: string; value: T }[] {
  return pattern.map((value, i) => ({
    date: dayjs()
      .subtract(todayIndex - i, "day")
      .format("YYYY-MM-DD"),
    value,
  }));
}

export function pct(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
