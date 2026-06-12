import AddPracticeAILN from "@/components/forms/AddPracticeAILN";
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

  return <AddPracticeAILN sessionToken={sessionToken} />;
}
