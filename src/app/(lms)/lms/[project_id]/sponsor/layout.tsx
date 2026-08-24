import SidebarAILN from "@/components/navigations/SidebarAILN";
import AppPageState from "@/components/states/AppPageState";
import { LOGIN_URL } from "@/lib/config";
import { getProgramGate } from "@/lib/gate";
import { canAccessSponsor } from "@/lib/sponsor-access";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function SponsorLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const { sessionToken, ailMember } = await getProgramGate(project_id);

  if (!sessionToken) redirect(LOGIN_URL);

  if (!ailMember || !canAccessSponsor(ailMember)) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return (
    <>
      <SidebarAILN sessionToken={sessionToken} variant="SPONSOR" />
      {children}
    </>
  );
}
