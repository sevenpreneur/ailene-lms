import { checkSession } from "@/apis/auth";
import SidebarAILN from "@/components/navigations/SidebarAILN";
import { LOGIN_URL } from "@/lib/config";
import { getHasPreAssessmentMock } from "@/mock-data/shared";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function GatedStudentLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const session = await checkSession();
  if (!session) redirect(LOGIN_URL);

  // Force pre-assessment completion before accessing any other student route.
  const hasPreAssessment = getHasPreAssessmentMock({
    projectId: project_id,
    userId: session.user.id,
  });
  if (!hasPreAssessment) {
    redirect(`/${project_id}/student/pre-assessment`);
  }

  return (
    <>
      <SidebarAILN session={session} variant="STUDENT" />
      {children}
    </>
  );
}
