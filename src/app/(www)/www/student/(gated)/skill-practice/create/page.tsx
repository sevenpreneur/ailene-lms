import CreateSelfPracticeAILN from "@/components/forms/CreateSelfPracticeAILN";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Catat Latihan",
};

export default async function AddPracticePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  return <CreateSelfPracticeAILN sessionToken={sessionToken} />;
}
