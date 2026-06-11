import AppPageState from "@/components/states/AppPageState";
import { getAilGate } from "@/lib/ail-gate";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, ailMember } = await getAilGate();

  if (!sessionToken) redirect("/auth/login");

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <>{children}</>;
}
