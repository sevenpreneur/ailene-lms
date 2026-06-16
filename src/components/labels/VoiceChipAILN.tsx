/**
 * Theme cluster chip with a trailing mention-count pill. Used in the
 * pre-assessment "Suara karyawan" section (challenges = neutral, expectations =
 * green).
 */
export default function VoiceChipAILN({
  label,
  count,
  tone = "neutral",
}: {
  label: string;
  count: number;
  tone?: "neutral" | "green";
}) {
  const toneCls =
    tone === "green"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
      : "border-dashboard-border bg-gray-50 text-gray-700 dark:bg-card-2 dark:text-gray-300";
  const countCls =
    tone === "green"
      ? "bg-white/70 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
      : "bg-white text-gray-600 dark:bg-card-1 dark:text-gray-300";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${toneCls}`}
    >
      {label}
      <span
        className={`min-w-5 rounded-full px-1.5 text-center text-xs font-semibold tabular-nums ${countCls}`}
      >
        {count}
      </span>
    </span>
  );
}
