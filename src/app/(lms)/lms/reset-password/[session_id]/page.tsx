import type { Metadata } from "next";
import { checkPasswordResetSession } from "@/apis/auth";
import ResetPasswordAILN from "@/components/pages/ResetPasswordAILN";
import { isPasswordResetId } from "@/lib/password";

export const metadata: Metadata = {
  title: "Atur Ulang Password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  const { session_id } = await params;
  if (!isPasswordResetId(session_id))
    return <ResetPasswordAILN sessionId={session_id} initialState="invalid" />;
  let state: "ready" | "invalid" | "unavailable" = "unavailable";
  try {
    const result = await checkPasswordResetSession(session_id);
    state = result.success
      ? "ready"
      : result.code === 400
        ? "invalid"
        : "unavailable";
  } catch {
    // Configuration and transport errors must not be reported as expired links.
  }
  return <ResetPasswordAILN sessionId={session_id} initialState={state} />;
}
