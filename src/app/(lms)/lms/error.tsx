"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Recovery({ retry }: { retry: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const destination = pathname + (search.size ? `?${search}` : "");
  return (
    <main
      className="mx-auto flex min-h-[60dvh] max-w-lg flex-col justify-center gap-4 p-6"
      role="alert"
    >
      <h1 className="text-xl font-medium">Halaman belum dapat dimuat</h1>
      <p className="text-sm text-muted-foreground">
        Data belum tersedia saat ini. Coba lagi. Jika sesi berakhir, masuk
        kembali untuk melanjutkan.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonAILN variant="dark" onClick={retry}>Coba lagi</ButtonAILN>
        <ButtonAILN asChild variant="outline">
          <Link
            href={`/auth/login?redirectTo=${encodeURIComponent(destination)}`}
          >
            Masuk kembali
          </Link>
        </ButtonAILN>
      </div>
    </main>
  );
}

export default function LmsError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Suspense>
      <Recovery retry={retry} />
    </Suspense>
  );
}
