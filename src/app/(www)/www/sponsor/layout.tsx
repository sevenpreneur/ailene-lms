import SidebarAILN from "@/components/navigations/SidebarAILN";
import AppPageState from "@/components/states/AppPageState";
import { getProgramGate } from "@/lib/gate";
import { canAccessSponsor } from "@/lib/sponsor-access";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function SponsorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, ailMember } = await getProgramGate();

  if (!sessionToken) redirect("/auth/login");

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
