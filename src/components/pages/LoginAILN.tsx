"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = getSafeRedirect(searchParams.get("redirectTo"));

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      const response = await fetch("/api/auth/callback/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: tokenResponse.access_token,
        }),
      });
      setIsLoading(false);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(body?.message ?? "Login gagal, silakan coba lagi.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    },
    onError: () => toast.error("Login dengan Google gagal atau dibatalkan."),
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8 rounded-2xl border border-dashboard-border bg-card-1 px-6 py-10 text-center shadow-sm">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat Datang di AI Learn
        </h1>
        <p className="text-sm text-muted-foreground">
          Masuk dengan akun Google untuk melanjutkan progres belajarmu.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <ButtonAILN
          variant="primary"
          size="defaultRounded"
          disabled={isLoading}
          onClick={() => login()}
          className="w-full"
        >
          {isLoading ? "Memproses login..." : "Lanjutkan dengan Google"}
        </ButtonAILN>
      </div>
    </div>
  );
}

export default function LoginAILN() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={<div className="h-80 w-full max-w-sm" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
