import LearningPathStudentAILN from "@/components/indexes/LearningPathStudentAILN";
import AppPageState from "@/components/states/AppPageState";
import { getAilGate } from "@/lib/ail-gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student",
};

export default async function LearningPathPage() {
  const { sessionToken, ailMember } = await getAilGate();

  if (!sessionToken) return null;

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <LearningPathStudentAILN sessionToken={sessionToken} />;
}
