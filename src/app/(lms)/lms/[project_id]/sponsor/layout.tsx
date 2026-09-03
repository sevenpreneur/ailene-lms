import { checkSession } from "@/apis/auth";
import SidebarAILN from "@/components/navigations/SidebarAILN";
import { LOGIN_URL } from "@/lib/config";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function SponsorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await checkSession();

  if (!session) redirect(LOGIN_URL);

  // Role gate dilepas untuk keperluan review — semua user login boleh masuk.

  return (
    <>
      <SidebarAILN session={session} variant="SPONSOR" />
      {children}
    </>
  );
}
