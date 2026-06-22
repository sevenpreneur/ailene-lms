import PreAssessmentReportAILN from "@/components/pages/PreAssessmentReportAILN";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Hasil Pre-Assessment",
};

export default async function PreAssessmentReportPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  return <PreAssessmentReportAILN sessionToken={sessionToken} />;
}
