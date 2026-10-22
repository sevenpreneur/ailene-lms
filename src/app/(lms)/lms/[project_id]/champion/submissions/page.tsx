import { getUseCaseSubmissions } from "@/apis/champion";
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
  const useCaseSubmissions = await getUseCaseSubmissions(project_id);

  return <SubmissionsChampionAILN useCaseSubmissions={useCaseSubmissions} />;
}
