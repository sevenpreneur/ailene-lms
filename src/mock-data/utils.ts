import dayjs from "dayjs";

export function daysAgo(n: number): Date {
  return dayjs().subtract(n, "day").toDate();
}

// Deterministic day-strip generator; the boolean pattern is fixed, only the date anchor moves.
export function relativeDayStrip<T>(
  pattern: T[],
  todayIndex = pattern.length - 1,
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
