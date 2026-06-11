import SidebarAILN from "@/components/navigations/SidebarAILN";
import AppPageState from "@/components/states/AppPageState";
import { getAilGate } from "@/lib/ail-gate";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function SponsorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, ailMember } = await getAilGate();

  if (!sessionToken) redirect("/auth/login");

  if (!ailMember || ailMember.role !== "SPONSOR") {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return (
    <>
      <SidebarAILN sessionToken={sessionToken} variant="SPONSOR" />
      {children}
    </>
  );
}
