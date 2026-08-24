import { checkSession } from "@/apis/auth";
import AppPageState from "@/components/states/AppPageState";
import { LOGIN_URL } from "@/lib/config";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function StudentLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const session = await checkSession();

  if (!session) redirect(LOGIN_URL);

  const projectAccess = session.project_access.find(
    (project) => project.id === project_id
  );
  if (
    !projectAccess ||
    (projectAccess.role !== "student" && projectAccess.role !== "champion")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <>{children}</>;
}
