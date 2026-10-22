import { checkSession } from "@/apis/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { redirect } from "next/navigation";
import LoginAILN from "@/components/pages/LoginAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default async function AuthLogin({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const session = await checkSession();
  if (session) redirect(safeRedirect((await searchParams).redirectTo));
  return <LoginAILN />;
}
