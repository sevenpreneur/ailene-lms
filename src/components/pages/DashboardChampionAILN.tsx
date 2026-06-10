"use client";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import TeamScoreBannerAILN from "@/components/cards/TeamScoreBannerAILN";
import ChampionCoachingAlertAILN from "@/components/indexes/ChampionCoachingAlertAILN";
import ChampionTeamMembersAILN from "@/components/indexes/ChampionTeamMembersAILN";
import RecentUseCasesAILN from "@/components/indexes/RecentUseCasesAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { setSessionToken, trpc } from "@/trpc/client";
import { Activity, Clock, Send } from "lucide-react";
import { useEffect } from "react";

// Platform tops out at L4 (L0 Assessment … L4 Advanced) — used to normalize
// the level component of the team score.
const MAX_LEVEL = 4;
// Team score is reported on a 0–5 scale, built from per-capita ratios so groups
// of any size compare fairly.
const MAX_SCORE = 5;

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
  const memberQ = trpc.auth.checkAilMember.useQuery();

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
    active_this_week: 0,
    submissions_sent: 0,
    members_submitted: 0,
    hours_saved: 0,
  };
  const allMembers = membersQ.data?.list ?? [];

  const groupName =
    (memberQ.data?.ail_member?.championed_groups ?? [])
      .map((g) => g.name)
      .join(", ") || "Tim";
  const avgLevel =
    allMembers.length > 0
      ? allMembers.reduce((sum, m) => sum + m.current_level.level_number, 0) /
        allMembers.length
      : 0;
  const level2Plus = allMembers.filter(
    (m) => m.current_level.level_number >= 2
  ).length;

  // Composite team score (0–5), mean of three size-independent ratios so it is
  // comparable across groups regardless of headcount:
  //   1. level mastery   = avg level / max level
  //   2. weekly activity = active this week / total members
  //   3. use case adoption = distinct members who submitted / total members
  const ratio = (n: number, d: number) => (d > 0 ? n / d : 0);
  const teamScore =
    stats.total > 0
      ? ((ratio(avgLevel, MAX_LEVEL) +
          ratio(stats.active_this_week, stats.total) +
          ratio(stats.members_submitted, stats.total)) /
          3) *
        MAX_SCORE
      : 0;

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

        {/* Team score banner */}
        <TeamScoreBannerAILN
          groupName={groupName}
          score={teamScore}
          maxScore={MAX_SCORE}
          level2Plus={level2Plus}
          totalMembers={stats.total}
        />

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ScorecardAILN
            title="Aktif Minggu Ini"
            value={stats.active_this_week}
            unit={`/ ${stats.total}`}
            icon={Activity}
            accent={ACCENT.sky}
          >
            <p className="text-xs text-muted-foreground">
              {pct(stats.active_this_week, stats.total)}% anggota tim
            </p>
          </ScorecardAILN>
          <ScorecardAILN
            title="Use Case Dikirim"
            value={stats.submissions_sent}
            unit="submission"
            icon={Send}
            accent={ACCENT.emerald}
          >
            <p className="text-xs text-muted-foreground">
              dari seluruh anggota grup
            </p>
          </ScorecardAILN>
          <ScorecardAILN
            title="Jam Dihemat"
            value={stats.hours_saved}
            unit="jam"
            icon={Clock}
            accent={ACCENT.amber}
          >
            <p className="text-xs text-muted-foreground">
              akumulasi dari use case dikirim
            </p>
          </ScorecardAILN>
        </div>

        {/* Team members (kiri, 2 kolom) + coaching alerts (kanan, 1 kolom).
            Pakai grid 3 kolom yang sama dengan stat cards di atas supaya lebar
            tabel = 2 kartu dan kartu coaching = 1 kartu (batas kolom sejajar). */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
          <div className="md:col-span-2">
            <ChampionTeamMembersAILN members={allMembers} />
          </div>

          <div className="flex flex-col gap-4">
            <ChampionCoachingAlertAILN members={allMembers} />
            <RecentUseCasesAILN />
          </div>
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

      {/* Team score banner */}
      <div className="h-32 rounded-xl border border-dashboard-border bg-gray-100 dark:bg-dashboard-border" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-lg border border-dashboard-border bg-white p-3 dark:bg-card-bg"
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
