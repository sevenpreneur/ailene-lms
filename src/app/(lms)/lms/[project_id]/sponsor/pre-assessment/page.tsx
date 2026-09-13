import { getPreAssessmentOrganization } from "@/apis/sponsor";
import PreAssessmentSponsorAILN from "@/components/pages/PreAssessmentSponsorAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor",
};

export default async function PreAssessmentPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const data = await getPreAssessmentOrganization(project_id);

  return <PreAssessmentSponsorAILN data={data} />;
}
