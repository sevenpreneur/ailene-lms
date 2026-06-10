"use client";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import ChampionCoachingAlertAILN from "@/components/indexes/ChampionCoachingAlertAILN";
import ChampionTeamMembersAILN from "@/components/indexes/ChampionTeamMembersAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { setSessionToken, trpc } from "@/trpc/client";
import { Clock, LineChart, TriangleAlert, Users } from "lucide-react";
import { useEffect } from "react";

const ACCENT = {
  sky: {
    tile: "bg-sky-50 dark:bg-sky-500/15",
    icon: "text-sky-600 dark:text-sky-300",
  },
  emerald: {
    tile: "bg-emerald-50 dark:bg-emerald-500/15",
    icon: "text-emerald-600 dark:text-emerald-300",
  },
  amber: {
    tile: "bg-amber-50 dark:bg-amber-500/15",
    icon: "text-amber-600 dark:text-amber-300",
  },
  red: {
    tile: "bg-red-50 dark:bg-red-500/15",
    icon: "text-red-600 dark:text-red-300",
  },
};

export default function DashboardChampionAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const membersQ = trpc.ailene.list.members.useQuery({});

  if (membersQ.isLoading) {
    return (
      <PageContainerAILN>
        <DashboardChampionSkeleton />
      </PageContainerAILN>
    );
  }
  if (membersQ.error) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const stats = membersQ.data?.stats ?? {
    total: 0,
    on_track: 0,
    at_risk: 0,
    behind: 0,
  };
  const allMembers = membersQ.data?.list ?? [];

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">
              Team Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor your team&apos;s learning progress and performance.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ScorecardAILN
            title="Total Members"
            value={stats.total}
            unit="persons"
            icon={Users}
            accent={ACCENT.sky}
          >
            <p className="text-xs text-muted-foreground">Active learners</p>
          </ScorecardAILN>
          <ScorecardAILN
            title="On Track"
            value={stats.on_track}
            unit="persons"
            icon={LineChart}
            accent={ACCENT.emerald}
          >
            <p className="text-xs text-muted-foreground">
              {pct(stats.on_track, stats.total)}% of team
            </p>
          </ScorecardAILN>
          <ScorecardAILN
            title="At Risk"
            value={stats.at_risk}
            unit="persons"
            icon={Clock}
            accent={ACCENT.amber}
          >
            <p className="text-xs text-muted-foreground">
              {pct(stats.at_risk, stats.total)}% of team
            </p>
          </ScorecardAILN>
          <ScorecardAILN
            title="Behind"
            value={stats.behind}
            unit="persons"
            icon={TriangleAlert}
            accent={ACCENT.red}
          >
            <p className="text-xs text-muted-foreground">
              {pct(stats.behind, stats.total)}% of team
            </p>
          </ScorecardAILN>
        </div>

        {/* Team members (left) + coaching alerts (right rail) */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] xl:items-start">
          <ChampionTeamMembersAILN members={allMembers} />

          <ChampionCoachingAlertAILN members={allMembers} />
        </div>
      </div>
    </PageContainerAILN>
  );
}

function DashboardChampionSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded bg-gray-200 dark:bg-dashboard-border" />
        <div className="h-3.5 w-72 rounded bg-gray-200 dark:bg-dashboard-border" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-lg border border-dashboard-border bg-white p-3 shadow-sm dark:bg-card-bg"
          >
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-md bg-gray-200 dark:bg-dashboard-border" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-dashboard-border" />
                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-dashboard-border" />
              </div>
            </div>
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-dashboard-border" />
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-lg border border-dashboard-border bg-white p-4 shadow-sm dark:bg-card-bg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-dashboard-border" />
            <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-dashboard-border" />
          </div>
          <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-dashboard-border" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-t border-dashboard-border pt-3"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-dashboard-border" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-40 rounded bg-gray-200 dark:bg-dashboard-border" />
                <div className="h-2.5 w-56 rounded bg-gray-200 dark:bg-dashboard-border" />
              </div>
              <div className="h-5 w-16 rounded bg-gray-200 dark:bg-dashboard-border" />
              <div className="h-5 w-20 rounded bg-gray-200 dark:bg-dashboard-border" />
              <div className="h-5 w-12 rounded bg-gray-200 dark:bg-dashboard-border" />
            </div>
          ))}
        </div>
      </div>

      {/* Coaching alerts card */}
      <div className="rounded-lg border border-dashboard-border bg-white p-4 shadow-sm dark:bg-card-bg">
        <div className="mb-3 h-4 w-36 rounded bg-gray-200 dark:bg-dashboard-border" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-dashboard-border bg-gray-50 p-3 dark:bg-card-inside-bg"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-dashboard-border" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 rounded bg-gray-200 dark:bg-dashboard-border" />
                <div className="h-2.5 w-40 rounded bg-gray-200 dark:bg-dashboard-border" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
