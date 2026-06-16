"use client";
import { formatScore } from "@/lib/ailene-format";
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

/**
 * Radar chart of the 6 competency-pillar scores (0..5) for the pre-assessment
 * baseline. Theme-aware grid / label colors.
 */
export default function PillarRadarAILN({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data, options } = useMemo(() => {
    const gridColor = isDark
      ? "rgba(148, 163, 184, 0.18)"
      : "rgba(148, 163, 184, 0.28)";
    const angleColor = isDark
      ? "rgba(148, 163, 184, 0.16)"
      : "rgba(148, 163, 184, 0.22)";
    const labelColor = isDark
      ? "rgba(226, 232, 240, 0.85)"
      : "rgba(71, 85, 105, 0.95)";
    const valueColor = isDark
      ? "rgba(148, 163, 184, 0.75)"
      : "rgba(100, 116, 139, 0.9)";

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Kesiapan",
            data: values,
            backgroundColor: "rgba(15, 122, 82, 0.14)",
            borderColor: "rgba(17, 24, 39, 0.85)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(17, 24, 39, 1)",
            pointBorderColor: isDark ? "#0F172A" : "#FFFFFF",
            pointBorderWidth: 2,
            pointRadius: 3.5,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: { parsed: { r: number } }) =>
                ` ${formatScore(ctx.parsed.r)} / 5`,
            },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 5,
            angleLines: { color: angleColor, lineWidth: 1 },
            grid: { color: gridColor, lineWidth: 1 },
            ticks: {
              display: true,
              stepSize: 1,
              color: valueColor,
              backdropColor: "transparent",
              font: { size: 10 },
            },
            pointLabels: {
              color: labelColor,
              font: { size: 12, weight: 500 as const },
              callback: (label: string, index: number) => [
                label,
                formatScore(values[index] ?? 0),
              ],
            },
          },
        },
      } as const,
    };
  }, [labels, values, isDark]);

  return (
    <div className="h-[300px] w-full">
      <Radar data={data} options={options} />
    </div>
  );
}
