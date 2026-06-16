// One program-health metric row for the executive view: label, sub-label, big
// percent value, a semantic-colored progress bar, and a "X dari Y" detail.
// Semantic color reads at a glance: green = healthy, amber = forming, rose =
// needs attention.

function healthTone(percent: number): {
  text: string;
  bar: string;
  track: string;
} {
  if (percent >= 70) {
    return {
      text: "text-emerald-600 dark:text-emerald-300",
      bar: "bg-emerald-500",
      track: "bg-emerald-100 dark:bg-emerald-500/15",
    };
  }
  if (percent >= 25) {
    return {
      text: "text-amber-600 dark:text-amber-300",
      bar: "bg-amber-500",
      track: "bg-amber-100 dark:bg-amber-500/15",
    };
  }
  return {
    text: "text-rose-600 dark:text-rose-300",
    bar: "bg-rose-500",
    track: "bg-rose-100 dark:bg-rose-500/15",
  };
}

export default function HealthMetricAILN({
  label,
  name,
  percent,
  detail,
}: {
  label: string;
  name: string;
  percent: number;
  detail: string;
}) {
  const tone = healthTone(percent);
  return (
    <li className="flex flex-col gap-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{name}</p>
      <p className={`text-2xl font-bold tabular-nums ${tone.text}`}>
        {percent.toLocaleString("id-ID")}%
      </p>
      <div
        className={`mt-1 h-1.5 w-full overflow-hidden rounded-full ${tone.track}`}
      >
        <div
          className={`h-full rounded-full ${tone.bar}`}
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </li>
  );
}
