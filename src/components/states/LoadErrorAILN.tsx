"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
export default function LoadErrorAILN({
  message = "Data belum dapat dimuat. Periksa koneksi lalu coba lagi.",
}: {
  message?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-dashboard-border bg-card-1 p-5 text-sm"
    >
      <p>{message}</p>
      <ButtonAILN
        variant="outline"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        {pending ? "Memuat..." : "Coba lagi"}
      </ButtonAILN>
    </div>
  );
}
