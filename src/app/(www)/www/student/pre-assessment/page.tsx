import PreAssessmentAILN from "@/components/pages/PreAssessmentAILN";
import AppPageState from "@/components/states/AppPageState";
import { getAilGate } from "@/lib/ail-gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-Assessment",
};

export default async function PreAssessmentPage() {
  const { sessionToken, ailMember } = await getAilGate();
  if (!sessionToken) return null;

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <PreAssessmentAILN sessionToken={sessionToken} />;
}
