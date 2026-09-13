"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { levelColorByNumber } from "@/lib/level-colors";
import { formatInt } from "@/lib/format";
import { useProjectId } from "@/lib/use-project-id";
import type { LevelDistribution } from "@/apis/sponsor";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const SEGMENTS = [
  {
    key: "promotor",
    label: "Promotor",
    // Level 3+
    test: (level: number) => level >= 3,
    color: levelColorByNumber(3),
    textColor: "#ffffff",
    card: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    labelText: "text-emerald-700 dark:text-emerald-300",
    desc: "Level 3+ · calon next-gen Champion · scale lever",
  },
  {
    key: "netral",
    label: "Netral",
    // Level 2
    test: (level: number) => level === 2,
    color: levelColorByNumber(2),
    textColor: "#ffffff",
    card: "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10",
    labelText: "text-blue-700 dark:text-blue-300",
    desc: "Level 2 · proficient applied · main bulk",
  },
  {
    key: "resistor",
    label: "Resistor",
    // Tertahan di Level 0–1
    test: (level: number) => level <= 1,
    color: levelColorByNumber(1),
    textColor: "#1f2937",
    card: "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
    labelText: "text-amber-700 dark:text-amber-300",
    desc: "Tertahan di Level 0–1 · perlu intervensi",
  },
] as const;

export default function LevelDistributionSponsorAILN({
  data,
  showDetailLink = true,
}: {
  data: LevelDistribution | null;
  showDetailLink?: boolean;
}) {
  const levels = data?.levels ?? [];
  const total = data?.total ?? 0;
  // Bucket the per-level counts into the three segments by level number (code = "L<n>").
  const segments = SEGMENTS.map((seg) => {
    const count = levels
      .filter((level) => seg.test(Number(level.code.slice(1))))
      .reduce((sum, level) => sum + level.count, 0);
    return {
      ...seg,
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });

  return (
    <Section showDetailLink={showDetailLink}>
      {total === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Belum ada karyawan terdaftar.
        </div>
      ) : (
        <>
          {/* Stacked segmentation bar */}
          <div className="flex h-16 w-full overflow-hidden rounded-lg">
            {segments.map((seg) => {
              const width = (seg.count / total) * 100;
              if (width <= 0) return null;
              return (
                <div
                  key={seg.key}
                  className="flex flex-col items-center justify-center px-1"
                  style={{
                    width: `${width}%`,
                    backgroundColor: seg.color,
                    color: seg.textColor,
                  }}
                  title={`${seg.label}: ${formatInt(seg.count)} karyawan (${seg.percent}%)`}
                >
                  {width >= 6 && (
                    <span className="text-lg font-bold leading-none">
                      {seg.percent}%
                    </span>
                  )}
                  {width >= 13 && (
                    <span className="mt-1 truncate text-[11px] font-medium opacity-90">
                      {formatInt(seg.count)} karyawan
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Descriptor cards */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {segments.map((seg) => (
              <div
                key={seg.key}
                className={`rounded-lg border p-3 ${seg.card}`}
              >
                <div
                  className={`text-[11px] font-bold uppercase tracking-wider ${seg.labelText}`}
                >
                  {seg.label}
                </div>
                <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                  {seg.desc}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

function Section({
  children,
  showDetailLink = true,
}: {
  children: React.ReactNode;
  showDetailLink?: boolean;
}) {
  const projectId = useProjectId();

  return (
    <SectionContainerAILN
      title="Distribusi Karyawan"
      desc="Promotor / Netral / Resistor · klik untuk drill-down per nama"
      headerRight={
        showDetailLink ? (
          <Link
            href={`/${projectId}/sponsor/workforce`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            Lihat Detail
            <ArrowRight className="size-4" />
          </Link>
        ) : undefined
      }
    >
      {children}
    </SectionContainerAILN>
  );
}
