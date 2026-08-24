import GroupDetailsSponsorAILN from "@/components/pages/GroupDetailsSponsorAILN";
import AppPageState from "@/components/states/AppPageState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor - Departemen",
};

export default async function SponsorGroupPage({
  params,
}: {
  params: Promise<{ group_id: string }>;
}) {
  const { group_id } = await params;
  const groupId = Number(group_id);

  if (!Number.isInteger(groupId) || groupId <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  return <GroupDetailsSponsorAILN groupId={groupId} />;

}
