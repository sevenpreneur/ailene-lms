import SidebarAILN from "@/components/navigations/SidebarAILN";
import AppPageState from "@/components/states/AppPageState";
import { setSessionToken, trpc } from "@/trpc/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function SponsorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) redirect("/auth/login");
  setSessionToken(sessionToken);

  const ailMember = (await trpc.auth.checkAilMember()).ail_member;
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
