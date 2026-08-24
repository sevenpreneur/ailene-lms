"use client";
import { Star } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

// Minimal team-score banner for the champion dashboard. Headline is a 0–5
// composite score (size-independent, comparable across groups). One subtitle.
// Kanan: sparkline tren skor tim 4 minggu (selaras dengan dashboard lms-fe).
export default function TeamScoreBannerAILN({
  groupName,
  score,
  maxScore,
  level2Plus,
  totalMembers,
}: {
  groupName: string;
  score: number;
  maxScore: number;
  level2Plus: number;
  totalMembers: number;
}) {
  const fmt = (n: number) => n.toFixed(1).replace(".", ",");

  // Tren 4 minggu diturunkan dari skor saat ini (placeholder demo sampai ada
  // data histori skor tim) — kurva naik yang berakhir di skor sekarang.
  const trend = [0.82, 0.9, 0.96, 1].map((f, i) => ({
    i,
    v: Math.round(score * f * 10) / 10,
  }));

  return (
    <section className="overflow-hidden rounded-2xl border border-hijau-t bg-gradient-to-br from-hijau-t to-white p-6 dark:border-claude/25 dark:from-claude/10 dark:to-transparent">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-claude dark:text-lime-bright">
            <Star className="size-3.5 fill-claude text-claude dark:fill-lime-bright dark:text-lime-bright" />
            Tim Saya · {groupName}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Skor Tim:
            </span>
            <span className="text-4xl font-bold leading-none tracking-tight text-claude dark:text-lime-bright sm:text-5xl">
              {fmt(score)}
            </span>
            <span className="text-2xl font-semibold text-gray-400 dark:text-gray-500">
              /{fmt(maxScore)}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {totalMembers > 0 ? (
              <>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {level2Plus} dari {totalMembers}
                </span>{" "}
                anggota sudah mencapai Level 2 ke atas
              </>
            ) : (
              "Belum ada anggota di tim ini"
            )}
          </p>
        </div>

        {/* Sparkline tren skor tim */}
        <div className="flex flex-col justify-center">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-claude dark:text-lime-bright">
            Tren Tim · 4 Minggu
          </p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Tooltip
                  cursor={{ stroke: "#1a7a52", strokeWidth: 1, strokeDasharray: "3 3" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e6f1d8", fontSize: 12, padding: "2px 8px" }}
                  labelFormatter={(label: unknown) =>
                    `Minggu ${Number(label) + 1}`
                  }
                  formatter={(value: unknown) => [
                    fmt(Number(value)),
                    "Skor tim",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#1a7a52"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#1a7a52", stroke: "#fff", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
