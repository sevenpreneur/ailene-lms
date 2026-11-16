import { getWorkflow } from "@/apis/workflows";
import WorkflowMapStudentAILN from "@/components/pages/WorkflowMapStudentAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppPageState from "@/components/states/AppPageState";
import LoadErrorAILN from "@/components/states/LoadErrorAILN";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Peta Alur" };

export default async function StudentWorkflowMapPage({
  params,
}: {
  params: Promise<{ project_id: string; map_id: string }>;
}) {
  const { project_id, map_id } = await params;
  const workflowId = Number(map_id);
  if (!Number.isInteger(workflowId) || workflowId <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const result = await getWorkflow(project_id, workflowId);
  if (result.kind === "not_found") return <AppPageState variant="NOT_FOUND" />;
  if (result.kind === "error") {
    return (
      <PageContainerAILN>
        <LoadErrorAILN message="Peta alur belum dapat dimuat. Coba lagi beberapa saat lagi." />
      </PageContainerAILN>
    );
  }
  // Remount per workflow so the editor's local state never leaks between maps.
  return (
    <WorkflowMapStudentAILN key={result.data.id} initialMap={result.data} />
  );
}
