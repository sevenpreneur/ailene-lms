import NoProjectStateAILN from "@/components/states/NoProjectStateAILN";
import { checkSession } from "@/apis/auth";
import { LOGIN_URL } from "@/lib/config";
import { redirect } from "next/navigation";

export default async function AILNRootPage() {
  const session = await checkSession();

  if (!session) redirect(LOGIN_URL);

  const firstProject = session.project_access[0];
  if (!firstProject) return <NoProjectStateAILN />;

  redirect(`/${firstProject.id}/${firstProject.role}`);
}
