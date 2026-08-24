import AppPageState from "@/components/states/AppPageState";
import { LOGIN_URL } from "@/lib/config";
import { getProgramGate } from "@/lib/gate";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function StudentLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const { sessionToken, ailMember } = await getProgramGate(project_id);

  if (!sessionToken) redirect(LOGIN_URL);

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <>{children}</>;
}
