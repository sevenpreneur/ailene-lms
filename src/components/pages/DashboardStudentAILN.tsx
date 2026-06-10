"use client";

import DashboardStudentSkeletonAILN from "@/components/cards/DashboardStudentSkeletonAILN";
import FirstWinCardAILN from "@/components/cards/FirstWinCardAILN";
import MomentumStripAILN from "@/components/cards/MomentumStripAILN";
import QuickActionsAILN from "@/components/cards/QuickActionsAILN";
import TodayFocusCardAILN from "@/components/cards/TodayFocusCardAILN";
import AnnouncementTickerAILN from "@/components/indexes/AnnouncementTickerAILN";
import RecommendationsAILN from "@/components/indexes/RecommendationsAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Star } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

dayjs.locale("id");

export default function DashboardStudentAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const userQ = trpc.auth.checkSession.useQuery();
  const memberQ = trpc.auth.checkAilMember.useQuery();

  if (userQ.isLoading || memberQ.isLoading) {
    return (
      <PageContainerAILN>
        <DashboardStudentSkeletonAILN />
      </PageContainerAILN>
    );
  }

  if (
    userQ.error ||
    memberQ.error ||
    !userQ.data?.user ||
    !memberQ.data?.ail_member
  ) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const user = userQ.data.user;
  const member = memberQ.data.ail_member;
  const firstName = user.full_name.split(" ")[0] ?? user.full_name;
  const dateLabel = dayjs().format("dddd, D MMMM YYYY").toUpperCase();

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-4">
        <AnnouncementTickerAILN />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium tracking-widest text-gray-500 dark:text-gray-400">
              {dateLabel}
            </div>
            <h1 className="mt-1 text-2xl font-bold leading-tight dark:text-white">
              Halo, {firstName}.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm dark:border dark:border-red-500/30 dark:bg-red-500/5 dark:shadow-[0_0_16px_rgba(239,68,68,0.15)]">
              {member.current_level?.icon && (
                <Image
                  src={member.current_level.icon}
                  alt={member.current_level.name}
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              )}
              <div className="flex flex-col">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Current Level
                </div>
                <div className="font-bold dark:text-white">
                  Level {member.current_level?.level_number ?? 0}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm dark:border dark:border-red-500/30 dark:bg-red-500/5 dark:shadow-[0_0_16px_rgba(239,68,68,0.15)]">
              <Star
                className="size-5 text-amber-500 dark:text-amber-400 dark:drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]"
                fill="currentColor"
              />
              <div className="flex flex-col">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total XP
                </div>
                <div className="font-bold dark:text-white">
                  {member.total_xp.toLocaleString()} XP
                </div>
              </div>
            </div>
          </div>
        </div>
        <FirstWinCardAILN />
        <TodayFocusCardAILN />
        <MomentumStripAILN />
        <QuickActionsAILN />
        <RecommendationsAILN />
      </div>
    </PageContainerAILN>
  );
}
