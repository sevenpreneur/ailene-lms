import { getWorkflows } from "@/apis/workflows";
import WorkflowMapsStudentAILN from "@/components/pages/WorkflowMapsStudentAILN";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Peta Alur Kerja" };

export default async function StudentWorkflowMapsPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  return <WorkflowMapsStudentAILN maps={await getWorkflows(project_id)} />;
}
