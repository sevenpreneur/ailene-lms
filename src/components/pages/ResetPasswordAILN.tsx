"use client";

import { ArrowLeft, CircleAlert, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import PasswordInputAILN from "@/components/fields/PasswordInputAILN";
import AuthErrorAILN from "@/components/elements/AuthErrorAILN";
import AuthFormHeadingAILN from "@/components/titles/AuthFormHeadingAILN";
import { validateNewPassword, type NewPasswordErrors } from "@/lib/password";
import AuthSplitLayoutAILN from "./AuthSplitLayoutAILN";

export default function ResetPasswordAILN({
  sessionId,
  initialState,
}: {
  sessionId: string;
  initialState: "ready" | "invalid" | "unavailable";
}) {
  const router = useRouter();
  const [checking, startChecking] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [done, setDone] = useState(false);
  const state = linkInvalid ? "invalid" : initialState;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || state !== "ready" || done) return;
    const validation = validateNewPassword(password, confirmation);
    setErrors(validation);
    setErrorMessage("");
    if (validation.password || validation.confirmation) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, password }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        if (result?.reason === "invalid_link") {
          setLinkInvalid(true);
          setPassword("");
          setConfirmation("");
        } else
          setErrorMessage(
            result?.message ||
              "Password belum dapat disimpan. Silakan coba lagi.",
          );
        return;
      }
      setPassword("");
      setConfirmation("");
      setDone(true);
    } catch {
      setErrorMessage(
        "Layanan reset password belum dapat dihubungi. Silakan coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayoutAILN>
      <div className="flex w-full max-w-sm flex-col gap-7">
        {done ? (
          <>
            <div role="status">
              <AuthFormHeadingAILN
                title="Password berhasil diubah"
                icon={<ShieldCheck className="size-7" />}
                description={
                  <p>
                    Semua sesi akun Anda sudah diakhiri. Masuk kembali dengan
                    password baru.
                  </p>
                }
              />
            </div>
            <ButtonAILN asChild variant="primary" size="choice" width="full">
              <Link href="/auth/login">Masuk sekarang</Link>
            </ButtonAILN>
          </>
        ) : state === "invalid" ? (
          <>
            <AuthFormHeadingAILN
              title="Tautan tidak berlaku"
              icon={<CircleAlert className="size-7" />}
              description={
                <p>
                  Tautan reset ini tidak valid, sudah digunakan, atau sudah
                  kedaluwarsa. Minta tautan baru untuk melanjutkan.
                </p>
              }
            />
            <ButtonAILN asChild variant="primary" size="choice" width="full">
              <Link href="/auth/forget-password">Minta tautan baru</Link>
            </ButtonAILN>
          </>
        ) : state === "unavailable" ? (
          <>
            <AuthFormHeadingAILN
              title="Tautan belum dapat diperiksa"
              icon={<CircleAlert className="size-7" />}
              description={
                <p>
                  Layanan reset password belum dapat dihubungi. Coba periksa
                  tautan ini lagi.
                </p>
              }
            />
            <ButtonAILN
              variant="primary"
              size="choice"
              width="full"
              disabled={checking}
              onClick={() => startChecking(() => router.refresh())}
            >
              {checking && <Loader2 className="size-4 animate-spin" />}
              {checking ? "Memeriksa..." : "Coba lagi"}
            </ButtonAILN>
          </>
        ) : (
          <>
            <AuthFormHeadingAILN
              title="Buat password baru"
              description={
                <p>
                  Gunakan minimal 8 karakter, maksimal 72 byte. Masukkan dua
                  kali untuk memastikan tidak salah ketik.
                </p>
              }
            />
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              aria-busy={submitting}
              aria-describedby={
                errorMessage ? "reset-password-error" : undefined
              }
            >
              <PasswordInputAILN
                inputId="reset-password"
                inputName="Password baru"
                name="password"
                inputPlaceholder="Masukkan password baru"
                autoComplete="new-password"
                value={password}
                onInputChange={(value) => {
                  setPassword(value);
                  setErrors((current) => ({ ...current, password: undefined }));
                }}
                errorMessage={errors.password}
                disabled={submitting}
                required
              />
              <PasswordInputAILN
                inputId="reset-password-confirmation"
                inputName="Konfirmasi password baru"
                name="confirmation"
                inputPlaceholder="Ulangi password baru"
                autoComplete="new-password"
                value={confirmation}
                onInputChange={(value) => {
                  setConfirmation(value);
                  setErrors((current) => ({
                    ...current,
                    confirmation: undefined,
                  }));
                }}
                errorMessage={errors.confirmation}
                disabled={submitting}
                required
              />
              <AuthErrorAILN id="reset-password-error" message={errorMessage} />
              <ButtonAILN
                type="submit"
                variant="primary"
                size="choice"
                width="full"
                disabled={submitting}
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? "Menyimpan..." : "Simpan password"}
              </ButtonAILN>
            </form>
          </>
        )}
        {!done && (
          <Link
            href="/auth/login"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-stakeholder-student-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
          >
            <ArrowLeft className="size-4" />
            Kembali ke login
          </Link>
        )}
      </div>
    </AuthSplitLayoutAILN>
  );
}
