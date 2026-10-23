import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ThemeSwitcherAILN from "@/components/buttons/ThemeSwitcherAILN";
import AuthGradientBackgroundAILN from "@/components/elements/AuthGradientBackgroundAILN";
import { LogoAileneAILN } from "@/components/elements/LogoAileneAILN";

export default function AuthSplitLayoutAILN({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden">
      <section
        aria-label="Ailene"
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-forest-deep p-12 text-white lg:flex xl:p-16"
      >
        <AuthGradientBackgroundAILN />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-forest-deep/65 via-forest-deep/15 to-forest-deep/90" />
        <div className="relative flex items-center gap-4">
          <LogoAileneAILN variant="white" className="h-10 w-auto" />
        </div>
        <div className="relative max-w-lg">
          <h2 className="text-4xl leading-tight font-medium tracking-tight text-balance xl:text-5xl">
            Langkah kecil hari ini.
            <br />
            <span className="text-lime-bright">Dampak besar dengan AI.</span>
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-white/75">
            Bangun keterampilan AI, terapkan dalam pekerjaan, dan tumbuh bersama
            tim Anda.
          </p>
        </div>
      </section>

      <section
        aria-label="Masuk ke akun"
        className="flex min-h-dvh w-full flex-col lg:min-h-0 lg:w-1/2 lg:overflow-y-auto"
      >
        <header className="flex shrink-0 items-center justify-end gap-5 px-6 py-5 sm:px-10">
          <Link
            href="/docs"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-xs text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
          >
            Panduan LMS
            <ArrowUpRight className="size-3.5" />
          </Link>
          <ThemeSwitcherAILN />
        </header>
        <div className="my-auto flex w-full justify-center px-6 py-8 sm:px-10 sm:py-12">
          {children}
        </div>
        <footer className="shrink-0 px-6 py-5 text-center text-xs text-muted-foreground">
          Ailene · Belajar untuk berdampak.
        </footer>
      </section>
    </main>
  );
}
