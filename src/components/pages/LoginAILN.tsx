"use client";

import { safeRedirect } from "@/lib/safe-redirect";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import PasswordInputAILN from "@/components/fields/PasswordInputAILN";
import AuthFormHeadingAILN from "@/components/titles/AuthFormHeadingAILN";
import AuthErrorAILN from "@/components/elements/AuthErrorAILN";
import AuthSplitLayoutAILN from "./AuthSplitLayoutAILN";
import { useGoogleLogin } from "@react-oauth/google";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";

type LoadingMethod = "GOOGLE" | "PASSWORD" | null;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.7c3.9-3.6 6-8.8 6-14.9Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5c-1.8 1.2-4.1 1.9-6.8 1.9-5.3 0-9.8-3.6-11.4-8.3H5.7v5.2A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.7a20 20 0 0 0 0 17.8l6.9-5.2Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.6 1 7.7 3l5.8-5.8A19.3 19.3 0 0 0 24 4 20 20 0 0 0 5.7 15.1l6.9 5.2C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMethod, setLoadingMethod] = useState<LoadingMethod>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const redirectTo = safeRedirect(searchParams.get("redirectTo"));
  const isLoading = loadingMethod !== null;

  const failLogin = (message: string) => {
    setErrorMessage(message);
    setLoadingMethod(null);
  };

  const finishLogin = async (response: Response, fallback: string) => {
    if (
      !response.ok ||
      response.redirected ||
      !response.headers.get("content-type")?.includes("application/json")
    ) {
      const body = await response.json().catch(() => null);
      failLogin(body?.message ?? fallback);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch("/api/auth/callback/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        await finishLogin(response, "Login gagal, silakan coba lagi.");
      } catch {
        failLogin("Login gagal, silakan coba lagi.");
      }
    },
    onError: () => failLogin("Login dengan Google gagal. Silakan coba lagi."),
    onNonOAuthError: () =>
      failLogin(
        "Login Google dibatalkan atau pop-up tidak dapat dibuka. Silakan coba lagi.",
      ),
  });

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    if (!email.trim() || !password) {
      setErrorMessage("Isi email dan password dulu.");
      return;
    }
    setErrorMessage("");
    setLoadingMethod("PASSWORD");
    try {
      const response = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      await finishLogin(response, "Login gagal, silakan coba lagi.");
    } catch {
      failLogin("Login gagal, silakan coba lagi.");
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-7">
      <AuthFormHeadingAILN
        title="Selamat datang kembali"
        description={<p>Lanjutkan perjalanan belajar dan penerapan AI Anda.</p>}
      />

      <div className="flex flex-col gap-5">
        <ButtonAILN
          type="button"
          variant="outline"
          size="choice"
          disabled={isLoading}
          width="full"
          onClick={() => {
            setErrorMessage("");
            setLoadingMethod("GOOGLE");
            googleLogin();
          }}
        >
          {loadingMethod === "GOOGLE" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {loadingMethod === "GOOGLE"
            ? "Menghubungkan..."
            : "Lanjutkan dengan Google"}
        </ButtonAILN>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-dashboard-border" />
          atau masuk dengan email
          <span className="h-px flex-1 bg-dashboard-border" />
        </div>
        <form
          onSubmit={handlePasswordLogin}
          className="flex flex-col gap-4"
          aria-busy={isLoading}
          aria-describedby={errorMessage ? "login-error" : undefined}
        >
          <InputAILN
            inputId="login-email"
            name="email"
            inputName="Email"
            inputType="email"
            inputIcon={<Mail />}
            inputPlaceholder="nama@perusahaan.com"
            characterLength={255}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onInputChange={setEmail}
            disabled={isLoading}
            required
          />
          <PasswordInputAILN
            inputId="login-password"
            name="password"
            inputName="Password"
            inputPlaceholder="Masukkan password"
            autoComplete="current-password"
            value={password}
            onInputChange={setPassword}
            disabled={isLoading}
            required
          />
          <Link
            href="/auth/forget-password"
            className="inline-flex min-h-8 items-center self-end rounded-lg text-sm font-medium text-stakeholder-student-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
          >
            Lupa password?
          </Link>
          <AuthErrorAILN id="login-error" message={errorMessage} />
          <ButtonAILN
            type="submit"
            variant="primary"
            size="choice"
            disabled={isLoading}
            width="full"
          >
            {loadingMethod === "PASSWORD" && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {loadingMethod === "PASSWORD" ? "Memproses login..." : "Masuk"}
            {!isLoading && <ArrowRight className="size-4" />}
          </ButtonAILN>
        </form>
      </div>

      <p className="border-t border-dashboard-border pt-5 text-center text-xs leading-5 text-muted-foreground">
        Belum bisa masuk?
        <br />
        Hubungi admin atau Champion program untuk bantuan akses akun.
      </p>
    </div>
  );
}

export default function LoginAILN() {
  return (
    <AuthSplitLayoutAILN>
      <Suspense
        fallback={
          <div
            className="h-[560px] w-full max-w-sm animate-pulse rounded-lg bg-card-2"
            aria-label="Memuat halaman login"
          />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthSplitLayoutAILN>
  );
}
