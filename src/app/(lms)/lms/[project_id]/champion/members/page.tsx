import { getMemberDetails, getTeamMembers } from "@/apis/champion";
import MembersChampionAILN from "@/components/pages/MembersChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Champion - Detail Anggota",
};

export default async function ChampionMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string }>;
  searchParams: Promise<{ member_id?: string }>;
}) {
  const { project_id } = await params;
  const { member_id } = await searchParams;

  const teamMembers = await getTeamMembers(project_id);

  // Fall back to the first member so the panel is never empty on first load.
  const requested = teamMembers?.list.some((m) => m.access_id === member_id)
    ? member_id
    : null;
  const selectedAccessId =
    requested ?? teamMembers?.list[0]?.access_id ?? null;

  const detail = selectedAccessId
    ? await getMemberDetails(project_id, selectedAccessId)
    : null;

  return (
    <MembersChampionAILN
      teamMembers={teamMembers}
      detail={detail}
      selectedAccessId={selectedAccessId}
    />
  );
}
