"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import { useGoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { toast } from "sonner";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

type LoadingMethod = "GOOGLE" | "PASSWORD" | null;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMethod, setLoadingMethod] = useState<LoadingMethod>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = getSafeRedirect(searchParams.get("redirectTo"));
  const isLoading = loadingMethod !== null;

  const finishLogin = async (response: Response, fallback: string) => {
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.message ?? fallback);
      setLoadingMethod(null);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoadingMethod("GOOGLE");
      try {
        const response = await fetch("/api/auth/callback/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        await finishLogin(response, "Login gagal, silakan coba lagi.");
      } catch {
        toast.error("Login gagal, silakan coba lagi.");
        setLoadingMethod(null);
      }
    },
    onError: () => toast.error("Login dengan Google gagal atau dibatalkan."),
  });

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    if (!email.trim() || !password) {
      toast.error("Isi email dan password dulu.");
      return;
    }

    setLoadingMethod("PASSWORD");
    try {
      const response = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      await finishLogin(response, "Login gagal, silakan coba lagi.");
    } catch {
      toast.error("Login gagal, silakan coba lagi.");
      setLoadingMethod(null);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8 rounded-2xl border border-dashboard-border bg-card-1 px-6 py-10 shadow-sm">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat Datang di AI Learn
        </h1>
        <p className="text-sm text-muted-foreground">
          Masuk untuk melanjutkan progres belajarmu.
        </p>
      </div>

      <form
        onSubmit={handlePasswordLogin}
        className="flex w-full flex-col gap-4"
      >
        <InputAILN
          inputId="login-email"
          inputName="Email"
          inputType="email"
          variant="STUDENT"
          inputIcon={<Mail className="size-4" />}
          inputPlaceholder="nama@perusahaan.com"
          characterLength={255}
          autoComplete="email"
          value={email}
          onInputChange={setEmail}
          disabled={isLoading}
        />
        <div className="relative">
          <InputAILN
            inputId="login-password"
            inputName="Password"
            inputType={showPassword ? "text" : "password"}
            variant="STUDENT"
            inputIcon={<Lock className="size-4" />}
            inputPlaceholder="Password"
            characterLength={72}
            autoComplete="current-password"
            value={password}
            onInputChange={setPassword}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((show) => !show)}
            aria-label={
              showPassword ? "Sembunyikan password" : "Lihat password"
            }
            className="absolute right-2 bottom-1.5 flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        <ButtonAILN
          type="submit"
          variant="primary"
          size="defaultRounded"
          disabled={isLoading}
          className="w-full"
        >
          {loadingMethod === "PASSWORD" ? "Memproses login..." : "Masuk"}
        </ButtonAILN>
      </form>

      <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-dashboard-border" />
        atau
        <div className="h-px flex-1 bg-dashboard-border" />
      </div>

      <ButtonAILN
        type="button"
        variant="light"
        size="defaultRounded"
        disabled={isLoading}
        onClick={() => googleLogin()}
        className="-mt-4 w-full"
      >
        {loadingMethod === "GOOGLE"
          ? "Memproses login..."
          : "Lanjutkan dengan Google"}
      </ButtonAILN>
    </div>
  );
}

export default function LoginAILN() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={<div className="h-96 w-full max-w-sm" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
