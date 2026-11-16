import { getCategories } from "@/apis/categories";
import { getAssignmentDrafts, getTeamMembers } from "@/apis/champion";
import { getUseCases } from "@/apis/use-cases";
import AssignmentChampionAILN from "@/components/pages/AssignmentChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tugas",
};

export default async function ChampionAssignmentPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [useCases, teamMembers, categories, drafts] = await Promise.all([
    getUseCases(project_id),
    getTeamMembers(project_id),
    getCategories(),
    getAssignmentDrafts(project_id),
  ]);

  return (
    <AssignmentChampionAILN
      useCases={useCases.list}
      teamMembers={teamMembers}
      categories={categories}
      draftBatches={(drafts?.batches ?? [])
        .map((batch) => ({
          ...batch,
          drafts: batch.drafts.filter((draft) => draft.kind === "USE_CASE"),
        }))
        .filter((batch) => batch.drafts.length > 0)}
    />
  );
}
