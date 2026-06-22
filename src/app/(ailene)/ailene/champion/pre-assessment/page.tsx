import PreAssessmentChampionAILN from "@/components/pages/PreAssessmentChampionAILN";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Champion",
};

export default async function PreAssessmentPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  return <PreAssessmentChampionAILN sessionToken={sessionToken} />;
}
