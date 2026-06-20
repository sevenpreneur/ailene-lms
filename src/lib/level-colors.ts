export function levelNumberFromCode(code: string): number {
  const level = Number(code.replace(/^L/i, ""));
  return Number.isFinite(level) ? level : 0;
}

export function levelColorByNumber(level: number): string {
  const safeLevel = Math.min(Math.max(Math.round(level), 0), 4);
  return `var(--ailn-level-${safeLevel})`;
}

export function levelColorByCode(code: string): string {
  return levelColorByNumber(levelNumberFromCode(code));
}

export function levelTextColorByCode(code: string): string {
  return levelNumberFromCode(code) <= 1 ? "#1f2937" : "#ffffff";
}
