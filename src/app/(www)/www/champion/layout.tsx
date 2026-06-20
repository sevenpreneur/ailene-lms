import SidebarAILN from "@/components/navigations/SidebarAILN";
import AppPageState from "@/components/states/AppPageState";
import { getProgramGate } from "@/lib/gate";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function ChampionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, ailMember } = await getProgramGate();

  if (!sessionToken) redirect("/auth/login");

  if (!ailMember || ailMember.role !== "CHAMPION") {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return (
    <>
      <SidebarAILN sessionToken={sessionToken} variant="CHAMPION" />
      {children}
    </>
  );
}
