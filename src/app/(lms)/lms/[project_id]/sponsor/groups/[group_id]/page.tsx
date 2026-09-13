import {
  getGroupAttentionMembers,
  getGroupDepartments,
  getGroupLevelDistribution,
  getGroupOverview,
  getGroupTopUseCases,
} from "@/apis/sponsor";
import GroupDetailsSponsorAILN from "@/components/pages/GroupDetailsSponsorAILN";
import AppPageState from "@/components/states/AppPageState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor - Departemen",
};

export default async function SponsorGroupPage({
  params,
}: {
  params: Promise<{ project_id: string; group_id: string }>;
}) {
  const { project_id, group_id } = await params;
  const groupId = Number(group_id);

  if (!Number.isInteger(groupId) || groupId <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const [departments, overview, distribution, topUseCases, attention] =
    await Promise.all([
      getGroupDepartments(project_id),
      getGroupOverview(project_id, groupId),
      getGroupLevelDistribution(project_id, groupId),
      getGroupTopUseCases(project_id, groupId),
      getGroupAttentionMembers(project_id, groupId),
    ]);

  return (
    <GroupDetailsSponsorAILN
      groupId={groupId}
      departments={departments}
      overview={overview}
      distribution={distribution}
      topUseCases={topUseCases}
      attention={attention}
    />
  );
}
