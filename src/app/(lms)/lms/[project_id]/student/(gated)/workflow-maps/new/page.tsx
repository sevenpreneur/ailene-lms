import WorkflowMapStudentAILN from "@/components/pages/WorkflowMapStudentAILN";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Peta Alur Baru" };

export default function StudentWorkflowMapNewPage() {
  return <WorkflowMapStudentAILN initialMap={null} />;
}
