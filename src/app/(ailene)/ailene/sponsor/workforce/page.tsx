import WorkforceSponsorAILN from "@/components/pages/WorkforceSponsorAILN";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Workforce",
};

export default async function WorkforcePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  return <WorkforceSponsorAILN sessionToken={sessionToken} />;
}
