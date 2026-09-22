import { checkSession } from "@/apis/auth";
import SidebarAILN from "@/components/navigations/SidebarAILN";
import { LOGIN_URL } from "@/lib/config";
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

  // Force pre-assessment completion first; a missing access is the parent layout's call, not ours.
  const projectAccess = session.project_access.find(
    (project) => project.id === project_id
  );
  if (projectAccess && !projectAccess.has_pre_assessment) {
    redirect(`/${project_id}/student/pre-assessment`);
  }

  return (
    <>
      <SidebarAILN session={session} variant="STUDENT" />
      {children}
    </>
  );
}
