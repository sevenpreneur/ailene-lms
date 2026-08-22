import PreAssessmentAILN from "@/components/pages/PreAssessmentAILN";
import AppPageState from "@/components/states/AppPageState";
import { getProgramGate } from "@/lib/gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-Assessment",
};

export default async function PreAssessmentPage() {
  const { sessionToken, ailMember } = await getProgramGate();
  if (!sessionToken) return null;

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return <PreAssessmentAILN sessionToken={sessionToken} />;
}
