import { checkSession } from "@/apis/auth";
import { getTeamMembers } from "@/apis/champion";
import DashboardChampionAILN from "@/components/pages/DashboardChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Champion",
};

export default async function ChampionPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [session, teamMembers] = await Promise.all([
    checkSession(),
    getTeamMembers(project_id),
  ]);

  const groupName =
    session?.project_access.find((project) => project.id === project_id)
      ?.group_name ?? "Tim";

  return (
    <DashboardChampionAILN
      teamMembers={teamMembers}
      groupName={groupName}
    />
  );
}
