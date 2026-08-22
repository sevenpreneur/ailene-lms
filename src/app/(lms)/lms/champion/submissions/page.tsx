import SubmissionsChampionAILN from "@/components/pages/SubmissionsChampionAILN";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Submissions",
};

export default async function ChampionSubmissionsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  return <SubmissionsChampionAILN sessionToken={sessionToken} />;
}
