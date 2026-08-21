import PreAssessmentChampionAILN from "@/components/pages/PreAssessmentChampionAILN";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Champion",
};

export default async function PreAssessmentPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  return <PreAssessmentChampionAILN sessionToken={sessionToken} />;
}
