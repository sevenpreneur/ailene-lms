import { checkSession, getProjectAccess } from "@/apis/auth";
import {
  getPreAssessmentQuestions,
  getPreAssessmentScore,
} from "@/apis/pre-assessment";
import SidebarAILN from "@/components/navigations/SidebarAILN";
import PreAssessmentAILN from "@/components/pages/PreAssessmentAILN";
import PreAssessmentReportAILN, {
  type PreAssessmentReportState,
} from "@/components/pages/PreAssessmentReportAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import { EmptyStateAILN } from "@/components/states/DataStatesAILN";
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
  if (!access?.has_pre_assessment) {
    const questions = await getPreAssessmentQuestions(project_id);
    if (!questions.success) {
      // No sidebar here, so this skips PageContainerAILN's sidebar offset to stay truly centred.
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-5">
          <div className="w-full max-w-md">
            {/* 404 here means the project has no pre-assessment version assigned yet, a setup gap rather than a fault. */}
            {questions.code === 404 ? (
              <EmptyStateAILN>
                Pre-assessment untuk program ini belum disiapkan. Hubungi admin
                programmu.
              </EmptyStateAILN>
            ) : (
              <AppErrorComponents />
            )}
          </div>
        </div>
      );
    }
    return <PreAssessmentAILN questions={questions.data} />;
  }

  // Questions are only read here to label the feedback, so their failure is not fatal.
  const [score, questions] = await Promise.all([
    getPreAssessmentScore(project_id),
    getPreAssessmentQuestions(project_id),
  ]);

  let state: PreAssessmentReportState;
  if (!score.success) state = { kind: "failed", message: score.message };
  else if (!score.data) state = { kind: "missing" };
  else state = { kind: "scored", score: score.data };

  return (
    <>
      <SidebarAILN session={session} variant="STUDENT" />
      <PreAssessmentReportAILN
        state={state}
        items={questions.success ? questions.data.items : []}
      />
    </>
  );
}
