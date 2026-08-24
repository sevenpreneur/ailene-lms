import SidebarAILN from "@/components/navigations/SidebarAILN";
import { LOGIN_URL } from "@/lib/config";
import { getProgramGate } from "@/lib/gate";
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
  const { sessionToken, ailMember } = await getProgramGate();
  if (!sessionToken) redirect(LOGIN_URL);

  // Force pre-assessment completion before accessing any other student route.
  if (ailMember && !ailMember.has_pre_assessment) {
    redirect(`/${project_id}/student/pre-assessment`);
  }

  return (
    <>
      <SidebarAILN sessionToken={sessionToken} variant="STUDENT" />
      {children}
    </>
  );
}
