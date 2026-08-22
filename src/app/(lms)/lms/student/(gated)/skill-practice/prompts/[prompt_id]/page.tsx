import SubmitPromptAILN from "@/components/forms/SubmitPromptAILN";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Kerjakan Prompt",
};

export default async function StudentPromptPracticePage({
  params,
}: {
  params: Promise<{ prompt_id: string }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  const { prompt_id } = await params;
  const promptIdNum = Number(prompt_id);

  return (
    <SubmitPromptAILN
      sessionToken={sessionToken}
      promptId={promptIdNum}
    />
  );
}
