"use client";

import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import InputAILN from "@/components/fields/InputAILN";
import AuthErrorAILN from "@/components/elements/AuthErrorAILN";
import AuthFormHeadingAILN from "@/components/titles/AuthFormHeadingAILN";
import AuthSplitLayoutAILN from "./AuthSplitLayoutAILN";

export default function ForgetPasswordAILN() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState<{ email: string; expires: number } | null>(
    null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setErrorMessage("");
    setSubmitting(true);
    try {
      const address = email.trim();
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address }),
      });
      const result = await response.json().catch(() => null);
      if (
        !response.ok ||
        !result?.success ||
        typeof result.data?.expires_in_minutes !== "number" ||
        result.data.expires_in_minutes <= 0
      ) {
        setErrorMessage(
          result?.message ||
            "Tautan reset belum dapat dikirim. Silakan coba lagi.",
        );
        return;
      }
      setSent({ email: address, expires: result.data.expires_in_minutes });
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
        {sent ? (
          <>
            <div role="status">
              <AuthFormHeadingAILN
                title="Cek email Anda"
                icon={<MailCheck className="size-7" />}
                description={
                  <p>
                    Tautan untuk membuat password baru sudah dikirim ke{" "}
                    <strong className="break-all text-foreground">
                      {sent.email}
                    </strong>
                    . Tautan berlaku {sent.expires} menit dan hanya bisa
                    digunakan sekali.
                  </p>
                }
              />
            </div>
            <p className="text-center text-xs leading-5 text-muted-foreground">
              Belum menerima email? Periksa folder spam. Meminta tautan baru
              akan membatalkan tautan sebelumnya.
            </p>
            <ButtonAILN
              variant="outline"
              size="choice"
              width="full"
              onClick={() => {
                setSent(null);
                setErrorMessage("");
              }}
            >
              Kirim ulang tautan
            </ButtonAILN>
          </>
        ) : (
          <>
            <AuthFormHeadingAILN
              title="Lupa password?"
              description={
                <p>
                  Masukkan email akun Anda. Kami akan mengirim tautan untuk
                  membuat password baru.
                </p>
              }
            />
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              aria-busy={submitting}
              aria-describedby={
                errorMessage ? "forget-password-error" : undefined
              }
            >
              <InputAILN
                inputId="forget-password-email"
                inputName="Email"
                name="email"
                inputType="email"
                inputIcon={<Mail />}
                inputPlaceholder="nama@perusahaan.com"
                characterLength={255}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onInputChange={setEmail}
                disabled={submitting}
                required
              />
              <AuthErrorAILN
                id="forget-password-error"
                message={errorMessage}
              />
              <ButtonAILN
                type="submit"
                variant="primary"
                size="choice"
                width="full"
                disabled={submitting}
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? "Mengirim..." : "Kirim tautan reset"}
              </ButtonAILN>
            </form>
          </>
        )}
        <Link
          href="/auth/login"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-stakeholder-student-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
        >
          <ArrowLeft className="size-4" />
          Kembali ke login
        </Link>
      </div>
    </AuthSplitLayoutAILN>
  );
}
