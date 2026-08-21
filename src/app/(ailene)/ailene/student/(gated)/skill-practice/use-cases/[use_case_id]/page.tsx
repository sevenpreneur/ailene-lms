import SubmitUseCaseAILN from "@/components/forms/SubmitUseCaseAILN";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { setSessionToken } from "@/trpc/server";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Kerjakan Use Case",
};

export default async function StudentUseCasePracticePage({
  params,
}: {
  params: Promise<{ use_case_id: string }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  const { use_case_id } = await params;
  const useCaseIdNum = Number(use_case_id);

  return (
    <SubmitUseCaseAILN
      sessionToken={sessionToken}
      useCaseId={useCaseIdNum}
    />
  );
}
