"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { SkeletonBlockAILN } from "@/components/states/DataStatesAILN";
import { formatInt } from "@/lib/ailene-format";
import { trpc } from "@/trpc/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const SEGMENTS = [
  {
    key: "promotor",
    label: "Promotor",
    // Level 3+
    test: (level: number) => level >= 3,
    bar: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    labelText: "text-emerald-700 dark:text-emerald-300",
    desc: "Level 3+ · calon next-gen Champion · scale lever",
  },
  {
    key: "netral",
    label: "Netral",
    // Level 2
    test: (level: number) => level === 2,
    bar: "bg-indigo-500",
    card: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/10",
    labelText: "text-indigo-700 dark:text-indigo-300",
    desc: "Level 2 · proficient applied · main bulk",
  },
  {
    key: "resistor",
    label: "Resistor",
    // Tertahan di Level 0–1
    test: (level: number) => level <= 1,
    bar: "bg-amber-500",
    card: "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
    labelText: "text-amber-700 dark:text-amber-300",
    desc: "Tertahan di Level 0–1 · perlu intervensi",
  },
] as const;

const DETAIL_HREF = "/sponsor/level-distribution";

export default function LevelDistributionSponsorAILN() {
  const q = trpc.read.levelDistribution.useQuery();

  if (q.isLoading) {
    return (
      <Section>
        <SkeletonBlockAILN className="h-40" />
      </Section>
    );
  }

  if (q.error || !q.data) {
    return (
      <Section>
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Gagal memuat distribusi karyawan.
        </div>
      </Section>
    );
  }

  const total = q.data.total;
  // Bucket the per-level counts into the three segments by level number (code = "L<n>").
  const segments = SEGMENTS.map((seg) => {
    const count = q.data.levels
      .filter((level) => seg.test(Number(level.code.slice(1))))
      .reduce((sum, level) => sum + level.count, 0);
    return {
      ...seg,
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });

  return (
    <Section>
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
                  className={`flex flex-col items-center justify-center px-1 text-white ${seg.bar}`}
                  style={{ width: `${width}%` }}
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

function Section({ children }: { children: React.ReactNode }) {
  return (
    <SectionContainerAILN
      title="Distribusi Karyawan"
      desc="Promotor / Netral / Resistor · klik untuk drill-down per nama"
      headerRight={
        <Link
          href={DETAIL_HREF}
          className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        >
          Lihat Detail
          <ArrowRight className="size-4" />
        </Link>
      }
    >
      {children}
    </SectionContainerAILN>
  );
}
