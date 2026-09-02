"use client";
import { HomeRecommendedCourseCardAILN } from "@/components/cards/HomeCourseCardAILN";
import ProgramPreviewCardAILN from "@/components/cards/ProgramPreviewCardAILN";
import ProjectJumpBackInCardAILN from "@/components/cards/ProjectJumpBackInCardAILN";
import HeroHomeAILN from "@/components/heroes/HeroHomeAILN";
import DiscoverySidebarAILN from "@/components/navigations/DiscoverySidebarAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import type { LmsSession } from "@/apis/auth";
import {
  getHomeLeaderboardMock,
  getHomeNewsMock,
  getHomeRecommendedCoursesMock,
  getProgramPreviewsMock,
} from "@/mock-data/explore";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowRight, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

dayjs.locale("id");
dayjs.extend(relativeTime);

const RANK_TINT: Record<number, string> = {
  1: "bg-lime-bright text-forest-deep",
  2: "bg-hijau-t text-claude",
  3: "bg-dashboard-bg text-foreground",
};

export default function HomeAILN({ session }: { session: LmsSession }) {
  const recommendedCourses = getHomeRecommendedCoursesMock();
  const news = getHomeNewsMock();
  const leaderboard = getHomeLeaderboardMock();
  const programPreviews = getProgramPreviewsMock();

  return (
    <>
      <DiscoverySidebarAILN session={session} />
      <PageContainerAILN>
        <div className="flex w-full flex-col gap-6">
          <HeroHomeAILN />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
              <section className="rounded-2xl border border-dashboard-border bg-card-1 p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Jump back in
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {session.project_access.map((project) => (
                    <ProjectJumpBackInCardAILN key={project.id} project={project} />
                  ))}
                  {programPreviews.map((program) => (
                    <ProgramPreviewCardAILN key={program.slug} program={program} />
                  ))}
                </div>
              </section>

              <section className="min-w-0 rounded-2xl border border-dashboard-border bg-card-1 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    Recommended Courses
                  </h2>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-claude hover:underline dark:text-lime-bright"
                  >
                    Browse all
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {recommendedCourses.map((course) => (
                    <HomeRecommendedCourseCardAILN
                      key={course.id}
                      course={course}
                    />
                  ))}
                </div>
              </section>
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <div className="rounded-2xl border border-dashboard-border bg-card-1 p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Newspaper size={16} />
                  News
                </h2>
                <div className="flex flex-col gap-4">
                  {news.map((item) => (
                    <div key={item.id}>
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.body}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {dayjs(item.time).fromNow()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dashboard-border bg-card-1 p-5">
                <h2 className="mb-3 text-lg font-semibold text-foreground">
                  Weekly Leaderboard
                </h2>
                <div className="flex flex-col gap-3">
                  {leaderboard.map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          RANK_TINT[entry.rank] ??
                          "bg-dashboard-bg text-muted-foreground"
                        }`}
                      >
                        {entry.rank}
                      </span>
                      {entry.avatar ? (
                        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={entry.avatar}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hijau-t text-xs font-semibold text-claude">
                          {entry.name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <p className="flex-1 truncate text-sm text-foreground">
                        {entry.name}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {entry.score}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainerAILN>
    </>
  );
}
