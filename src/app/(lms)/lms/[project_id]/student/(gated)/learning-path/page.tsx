import LearningPathStudentAILN from "@/components/pages/LearningPathStudentAILN";
import AppPageState from "@/components/states/AppPageState";
import { getProgramGate } from "@/lib/gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student",
};

export default async function LearningPathPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const { sessionToken, ailMember } = await getProgramGate(project_id);

  if (!sessionToken) return null;

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <LearningPathStudentAILN />;
}
