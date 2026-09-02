"use client";
import type { ExploreCourseMock, ExploreVendorMock } from "@/mock-data/explore";
import { Clock, Layers, Target } from "lucide-react";
import Image from "next/image";

export function HomeRecommendedCourseCardAILN({
  course,
}: {
  course: ExploreCourseMock & { vendor: ExploreVendorMock | undefined };
}) {
  return (
    <div className="rounded-xl border border-dashboard-border p-3">
      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-dashboard-bg">
        <Image
          src={course.image}
          alt={course.title}
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <Layers size={12} />
          {course.level}
          <span className="opacity-60">|</span>
          <Clock size={12} />
          {course.duration}
          <span className="opacity-60">|</span>
          <Target size={12} />
          {course.points}
        </div>
      </div>
      <div className="px-1 pt-3">
        <p className="truncate text-base font-bold text-foreground">
          {course.title}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            {course.vendor?.logo && (
              <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-dashboard-border">
                <Image
                  src={course.vendor.logo}
                  alt={course.vendor.name}
                  fill
                  unoptimized
                  className="object-contain p-0.5"
                />
              </span>
            )}
            <span className="truncate">{course.vendor?.name ?? ""}</span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-claude dark:text-lime-bright">
            {course.action}
          </span>
        </div>
      </div>
    </div>
  );
}
