"use client";
import { HomeRecommendedCourseCardAILN } from "@/components/cards/HomeCourseCardAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import {
  getExploreCoursesMock,
  getExploreVendorsMock,
  type ExploreLevel,
} from "@/mock-data/explore";
import { Compass } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

const LEVELS: ExploreLevel[] = ["Beginner", "Intermediate", "Advanced"];

export default function ExploreAILN() {
  const vendors = getExploreVendorsMock();
  const courses = getExploreCoursesMock();

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [level, setLevel] = useState<ExploreLevel | null>(null);

  const visibleCourses = useMemo(
    () =>
      courses
        .filter((course) => !vendorId || course.vendorId === vendorId)
        .filter((course) => !level || course.level === level)
        .map((course) => ({
          ...course,
          vendor: vendors.find((vendor) => vendor.id === course.vendorId),
        })),
    [courses, vendors, vendorId, level]
  );

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        {/* Header */}
        <div className="rounded-2xl bg-linear-to-b from-hijau-t to-white p-6 dark:from-claude/10 dark:to-card-1 sm:p-8">
          <span className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-forest-deep shadow-sm dark:bg-card-1 dark:text-lime-bright">
            <Compass size={20} />
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-forest-deep dark:text-white">
            Explore
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-forest-deep/70 dark:text-gray-300 sm:text-base">
            Katalog kursus AI dari berbagai vendor. Pilih yang paling relevan
            dengan pekerjaanmu, lalu lanjutkan kapan pun kamu siap.
          </p>
        </div>

        {/* Filters di kiri, katalog di kanan */}
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-60 lg:self-start xl:w-64">
            <div className="flex flex-col gap-4 rounded-2xl border border-dashboard-border bg-card-1 p-5">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Vendor
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Semua"
                    active={vendorId === null}
                    onClick={() => setVendorId(null)}
                  />
                  {vendors.map((vendor) => (
                    <FilterChip
                      key={vendor.id}
                      label={vendor.name}
                      logo={vendor.logo}
                      active={vendorId === vendor.id}
                      onClick={() =>
                        setVendorId((prev) =>
                          prev === vendor.id ? null : vendor.id
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-dashboard-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Level
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Semua"
                    active={level === null}
                    onClick={() => setLevel(null)}
                  />
                  {LEVELS.map((item) => (
                    <FilterChip
                      key={item}
                      label={item}
                      active={level === item}
                      onClick={() =>
                        setLevel((prev) => (prev === item ? null : item))
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Catalog */}
          <section className="min-w-0 flex-1 rounded-2xl border border-dashboard-border bg-card-1 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Semua Kursus
              </h2>
              <span className="text-sm text-muted-foreground">
                {visibleCourses.length} kursus
              </span>
            </div>

            {visibleCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {visibleCourses.map((course) => (
                  <HomeRecommendedCourseCardAILN
                    key={course.id}
                    course={course}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada kursus yang cocok dengan filter ini.
              </p>
            )}
          </section>
        </div>
      </div>
    </PageContainerAILN>
  );
}

function FilterChip({
  label,
  logo,
  active,
  onClick,
}: {
  label: string;
  logo?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-claude bg-claude text-white dark:border-lime-bright dark:bg-lime-bright dark:text-forest-deep"
          : "border-dashboard-border text-muted-foreground hover:bg-dashboard-bg hover:text-foreground"
      }`}
    >
      {logo && (
        <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-dashboard-border">
          <Image
            src={logo}
            alt=""
            fill
            unoptimized
            className="object-contain p-0.5"
          />
        </span>
      )}
      {label}
    </button>
  );
}
