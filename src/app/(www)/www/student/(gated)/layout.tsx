import SidebarAILN from "@/components/navigations/SidebarAILN";
import { getAilGate } from "@/lib/ail-gate";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function GatedStudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, ailMember } = await getAilGate();
  if (!sessionToken) redirect("/auth/login");

  // Force pre-assessment completion before accessing any other student route.
  if (ailMember && !ailMember.has_pre_assessment) {
    redirect("/student/pre-assessment");
  }

  return (
    <>
      <SidebarAILN sessionToken={sessionToken} variant="STUDENT" />
      {children}
    </>
  );
}
