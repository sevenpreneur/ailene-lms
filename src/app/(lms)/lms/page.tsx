import { checkSession } from "@/apis/auth";
import HomeAILN from "@/components/pages/HomeAILN";
import NoProjectStateAILN from "@/components/states/NoProjectStateAILN";
import { LOGIN_URL } from "@/lib/config";
import { redirect } from "next/navigation";

// Discovery overview — deliberately not tied to any single project.
export default async function AILNRootPage() {
  const session = await checkSession();

  if (!session) redirect(LOGIN_URL);

  if (session.project_access.length === 0) return <NoProjectStateAILN />;

  return <HomeAILN session={session} />;
}
