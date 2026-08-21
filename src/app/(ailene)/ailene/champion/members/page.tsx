import MembersChampionAILN from "@/components/pages/MembersChampionAILN";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Champion - Detail Anggota",
};

export default async function ChampionMembersPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  return (
    <Suspense>
      <MembersChampionAILN sessionToken={sessionToken} />
    </Suspense>
  );
}
