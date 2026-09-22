import { checkSession, getProjectAccess } from "@/apis/auth";
import {
  getPreAssessmentRecommendations,
  getPreAssessmentScore,
} from "@/apis/pre-assessment";
import SidebarAILN from "@/components/navigations/SidebarAILN";
import PreAssessmentAILN from "@/components/pages/PreAssessmentAILN";
import PreAssessmentReportAILN from "@/components/pages/PreAssessmentReportAILN";
import { LOGIN_URL } from "@/lib/config";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pre-Assessment",
};

// One route, two faces: the questionnaire until it's submitted, the report afterwards.
export default async function PreAssessmentPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const session = await checkSession();
  if (!session) redirect(LOGIN_URL);

  const access = await getProjectAccess(project_id);

  // No sidebar on the questionnaire: an unsubmitted student is held here with nowhere else to go.
  if (!access?.has_pre_assessment) return <PreAssessmentAILN />;

  // Pillars are ready immediately; the client polls on from this snapshot for the recommendations.
  const [score, recommendations] = await Promise.all([
    getPreAssessmentScore(project_id),
    getPreAssessmentRecommendations(project_id),
  ]);

  return (
    <>
      <SidebarAILN session={session} variant="STUDENT" />
      <PreAssessmentReportAILN
        report={score?.report ?? null}
        initialRecommendations={recommendations}
      />
    </>
  );
}
