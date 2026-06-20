"use client";
import { formatCompactIdr, formatInt } from "@/lib/format";
import { Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const SPARK_GREEN = "#10b981";

/**
 * "Headline · Bulan Ini" hero for the Sponsor dashboard: the single number that
 * matters (productive %) plus the value realized (hours saved last week +
 * annualized ROI), over a decorative rising hours-saved sparkline.
 */
export default function HeadlineAILN({
  productivePercent,
  hoursSavedLastWeek,
  roiAnnualized,
  trend,
  updatedLabel,
}: {
  productivePercent: number;
  hoursSavedLastWeek: number;
  roiAnnualized: number;
  trend: { label: string; hours: number }[];
  updatedLabel: string;
}) {
  const roi = formatCompactIdr(roiAnnualized);
  const roiWord =
    roi.suffix === "M" ? "miliar" : roi.suffix === "jt" ? "juta" : "";
  const roiText = `Rp ${roi.value}${roiWord ? ` ${roiWord}` : ""}/tahun`;

  return (
    <section className="ailn-card relative overflow-hidden border p-7">
      {/* Soft brand wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-emerald-50/40 dark:from-violet-500/5 dark:via-transparent dark:to-emerald-500/5" />

      {/* Decorative sparkline (hours saved, 12 weeks) */}
      <div className="pointer-events-none absolute right-0 top-0 h-2/3 w-[44%] opacity-90">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trend}
            margin={{ top: 12, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="headline-spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SPARK_GREEN} stopOpacity={0.28} />
                <stop offset="100%" stopColor={SPARK_GREEN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey="hours"
              type="monotone"
              stroke={SPARK_GREEN}
              strokeWidth={2.5}
              fill="url(#headline-spark)"
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          <Sparkles size={12} className="fill-current" />
          Headline · Bulan ini
        </div>

        <h2 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-foreground md:text-5xl">
          <span className="text-emerald-600 dark:text-emerald-400">
            {productivePercent}%
          </span>{" "}
          karyawan Anda sudah produktif menggunakan AI
        </h2>

        <p className="mt-4 max-w-2xl text-base text-foreground/90">
          Total{" "}
          <span className="font-bold">
            {formatInt(Math.round(hoursSavedLastWeek))} jam
          </span>{" "}
          dihemat minggu lalu — <span className="font-bold">{roiText}</span>{" "}
          <span className="text-muted-foreground">(annualized)</span>
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Manager-validated · Live data, diperbarui {updatedLabel}
        </p>
      </div>
    </section>
  );
}
