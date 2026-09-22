import { getProjectAccess } from "@/apis/auth";
import {
  getExecutiveView,
  getLevelDistribution,
  getOrganizationLeaderboard,
  getOrganizationStats,
  getProficiencyTrends,
  getProgramHealth,
  getSponsorHeadline,
  getSponsorRecentActivity,
} from "@/apis/sponsor";
import DashboardSponsorAILN from "@/components/pages/DashboardSponsorAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor",
};

export default async function SponsorPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [
    executiveView,
    headline,
    orgStats,
    programHealth,
    recentActivity,
    levelDistribution,
    proficiencyTrends,
    organizationLeaderboard,
    access,
  ] = await Promise.all([
    getExecutiveView(project_id),
    getSponsorHeadline(project_id),
    getOrganizationStats(project_id),
    getProgramHealth(project_id),
    getSponsorRecentActivity(project_id),
    getLevelDistribution(project_id),
    getProficiencyTrends(project_id),
    getOrganizationLeaderboard(project_id),
    getProjectAccess(project_id),
  ]);

  return (
    <DashboardSponsorAILN
      executiveView={executiveView}
      headline={headline}
      orgStats={orgStats}
      programHealth={programHealth}
      recentActivity={recentActivity}
      levelDistribution={levelDistribution}
      proficiencyTrends={proficiencyTrends}
      organizationLeaderboard={organizationLeaderboard}
      org={access?.company_name ?? null}
      program={access?.name ?? ""}
    />
  );
}
