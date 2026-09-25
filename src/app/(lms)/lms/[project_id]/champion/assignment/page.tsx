import { checkSession } from "@/apis/auth";
import { getCategories } from "@/apis/categories";
import { getAssignmentDrafts, getTeamMembers } from "@/apis/champion";
import { getPrompts } from "@/apis/prompts";
import { getUseCases } from "@/apis/use-cases";
import AssignmentChampionAILN from "@/components/pages/AssignmentChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignment",
};

export default async function ChampionAssignmentPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [session, prompts, useCases, teamMembers, categories, drafts] =
    await Promise.all([
      checkSession(),
      getPrompts(project_id),
      getUseCases(project_id),
      getTeamMembers(project_id),
      getCategories(),
      getAssignmentDrafts(project_id),
    ]);

  const access = session?.project_access.find(
    (project) => project.id === project_id
  );
  const group =
    access?.group_id != null
      ? { id: access.group_id, name: access.group_name ?? "Tim" }
      : null;

  return (
    <AssignmentChampionAILN
      prompts={prompts.list}
      useCases={useCases.list}
      teamMembers={teamMembers}
      categories={categories}
      draftBatches={drafts?.batches ?? []}
      group={group}
    />
  );
}
