import { getPromptSubmissions, getUseCaseSubmissions } from "@/apis/champion";
import SubmissionsChampionAILN from "@/components/pages/SubmissionsChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submissions",
};

export default async function ChampionSubmissionsPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [promptSubmissions, useCaseSubmissions] = await Promise.all([
    getPromptSubmissions(project_id),
    getUseCaseSubmissions(project_id),
  ]);

  return (
    <SubmissionsChampionAILN
      promptSubmissions={promptSubmissions}
      useCaseSubmissions={useCaseSubmissions}
    />
  );
}
