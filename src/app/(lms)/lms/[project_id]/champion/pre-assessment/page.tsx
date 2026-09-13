import { getPreAssessmentTeam } from "@/apis/champion";
import PreAssessmentChampionAILN from "@/components/pages/PreAssessmentChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Champion",
};

export default async function PreAssessmentPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const data = await getPreAssessmentTeam(project_id);

  return <PreAssessmentChampionAILN data={data} />;
}
