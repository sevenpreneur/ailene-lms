import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Use Case",
};

export default async function AddPracticePage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  redirect(`/${project_id}/student/skill-practice`);
}
