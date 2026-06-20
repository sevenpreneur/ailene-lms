import AppPageState from "@/components/states/AppPageState";
import { getProgramGate } from "@/lib/gate";
import { redirect } from "next/navigation";

export default async function AILNRootPage() {
  const { sessionToken, ailMember } = await getProgramGate();

  if (!sessionToken) redirect("/auth/login");

  if (!ailMember) return <AppPageState variant="FORBIDDEN" />;

  if (ailMember.role === "CHAMPION") redirect("/champion");
  if (ailMember.role === "STUDENT") redirect("/student");
  if (ailMember.role === "SPONSOR") redirect("/sponsor");

  return <AppPageState variant="FORBIDDEN" />;
}
