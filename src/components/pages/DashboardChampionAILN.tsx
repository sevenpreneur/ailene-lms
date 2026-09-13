"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ScorecardAILN from "@/components/cards/ScorecardAILN";
import TeamScoreBannerAILN from "@/components/cards/TeamScoreBannerAILN";
import ChampionCoachingAlertAILN from "@/components/indexes/ChampionCoachingAlertAILN";
import ChampionTeamMembersAILN from "@/components/indexes/ChampionTeamMembersAILN";
import MembersLabelChampionAILN from "@/components/labels/MembersLabelChampionAILN";
import RecentUseCasesAILN from "@/components/indexes/RecentUseCasesAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import { getTeamMembersMock } from "@/mock-data/champion";
import { getAilMemberMock } from "@/mock-data/shared";
import { useProjectId } from "@/lib/use-project-id";
import { Activity, Clock, Plus, Send } from "lucide-react";
import Link from "next/link";

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

export default function DashboardChampionAILN() {
  const projectId = useProjectId();

  const { stats, list: allMembers } = getTeamMembersMock({});
  const ailMember = getAilMemberMock({ projectId, userId: "current" });

  const groupName =
    ailMember.championed_groups.map((g) => g.name).join(", ") || "Tim";
  const avgLevel =
    allMembers.length > 0
      ? allMembers.reduce((sum, m) => sum + m.current_level.level_number, 0) /
        allMembers.length
      : 0;
  const level2Plus = allMembers.filter(
    (m) => m.current_level.level_number >= 2
  ).length;

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
        <header className="sticky top-14 z-30 -mx-4 -mt-6 flex flex-wrap items-center justify-between gap-3 border-b lg:top-0 border-dashboard-border bg-background/80 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6 xl:-mx-8 xl:px-8">
          <h1 className="display-font text-xl font-bold tracking-tight text-foreground">
            Dashboard Team
          </h1>
          <div className="flex items-center gap-3">
            <MembersLabelChampionAILN count={stats.total} />
            <Link href={`/${projectId}/champion/assignment`}>
              <ButtonAILN variant="champion" size="medium">
                <Plus className="size-4" />
                Assign Tugas
              </ButtonAILN>
            </Link>
          </div>
        </header>

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

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
