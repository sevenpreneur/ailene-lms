import ModuleListStudentAILN from "@/components/indexes/ModuleListStudentAILN";
import AppPageState from "@/components/states/AppPageState";
import { getAilGate } from "@/lib/ail-gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student",
};

export default async function ModulesPage() {
  const { sessionToken, ailMember } = await getAilGate();

  if (!sessionToken) return null;

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <ModuleListStudentAILN sessionToken={sessionToken} />;
}
