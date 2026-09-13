"use client";
import AchievementsCardAILN from "@/components/charts/AchievementsCardAILN";
import CompetencyProfileAILN from "@/components/charts/CompetencyProfileAILN";
import LevelProgressCardAILN from "@/components/charts/LevelProgressCardAILN";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import LeaderboardPanelStudentAILN from "@/components/indexes/LeaderboardPanelStudentAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { StudentLevel } from "@/apis/learnings";
import type {
  StudentCompetency,
  StudentLeaderboard,
  StudentLevelProgress,
} from "@/apis/student";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

interface MyProgressStudentAILNProps {
  levels: StudentLevel[];
  levelProgress: StudentLevelProgress | null;
  competency: StudentCompetency | null;
  leaderboard: StudentLeaderboard | null;
}

export default function MyProgressStudentAILN({
  levels,
  levelProgress,
  competency,
  leaderboard,
}: MyProgressStudentAILNProps) {
  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-5">
        <PageHeaderAILN
          title="Progress Belajar AI"
          desc="Pantau perkembangan level, kompetensi, dan kontribusi XP dalam satu tempat."
        />

        {/* Level journey */}
        <PreAssessmentReportGateway />

        {/* Level Progress 60% sejajar Capaian Kamu 40% (tinggi sama) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <LevelProgressCardAILN
            levels={levels}
            currentLevelNumber={levelProgress?.current_level_number ?? 0}
            tasksRequired={levelProgress?.tasks_required ?? 0}
            tasksDone={levelProgress?.tasks_done ?? 0}
            className="h-full"
          />
          <AchievementsCardAILN
            totalXp={levelProgress?.total_xp ?? 0}
            currentLevelNumber={levelProgress?.current_level_number ?? null}
            currentLevelName={levelProgress?.current_level_name ?? null}
            useCaseApprovedCount={levelProgress?.use_case_approved_count ?? 0}
            promptApprovedCount={levelProgress?.prompt_approved_count ?? 0}
            hoursSavedTotal={levelProgress?.hours_saved_total ?? 0}
            toolsMastered={levelProgress?.tools_mastered ?? []}
            className="h-full"
          />
        </div>

        {/* Profil Kompetensi 60% sejajar Leaderboard 40% (tinggi sama) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <CompetencyProfileAILN
            dimensions={competency?.dimensions ?? []}
            currentLevelNumber={competency?.current_level_number ?? 0}
            className="h-full"
          />
          <LeaderboardPanelStudentAILN
            data={
              leaderboard ?? { group: null, my_rank: 0, total: 0, leaderboard: [] }
            }
            className="h-full"
          />
        </div>
      </div>
    </PageContainerAILN>
  );
}

function PreAssessmentReportGateway() {
  const projectId = useProjectId();
  return (
    <Link
      href={`/${projectId}/student/my-progress/pre-assessment-report`}
      className="ailn-card group flex flex-col items-start gap-4 border bg-gray-950 p-5 transition sm:flex-row sm:items-center sm:justify-between dark:bg-card-1"
    >
      <span className="flex min-w-0 items-center gap-4">
        <ClipboardCheck className="size-7 shrink-0 text-white" />
        <span className="min-w-0">
          <span className="block text-base font-bold text-white">
            Laporan Pre-Assessment
          </span>
          <span className="mt-1 block text-sm text-gray-300 dark:text-gray-400">
            Lihat ringkasan kompetensi dan rekomendasi use case AI kamu.
          </span>
        </span>
      </span>
      <ButtonAILN variant="light" size="medium" className="shrink-0">
        Lihat Selengkapnya
        <ArrowRight className="size-4" />
      </ButtonAILN>
    </Link>
  );
}
