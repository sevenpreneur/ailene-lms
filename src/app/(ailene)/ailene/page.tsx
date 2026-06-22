import AppPageState from "@/components/states/AppPageState";
import { LOGIN_URL } from "@/lib/config";
import { getProgramGate } from "@/lib/gate";
import { redirect } from "next/navigation";

export default async function AILNRootPage() {
  const { sessionToken, ailMember } = await getProgramGate();

  if (!sessionToken) redirect(LOGIN_URL);

  if (!ailMember) return <AppPageState variant="FORBIDDEN" />;

  if (ailMember.role === "CHAMPION") redirect("/champion");
  if (ailMember.role === "STUDENT") redirect("/student");
  if (ailMember.role === "SPONSOR") redirect("/sponsor");

  return <AppPageState variant="FORBIDDEN" />;
}
