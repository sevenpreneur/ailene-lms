"use client";

import type { LmsSession } from "@/apis/auth";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import ThemeSwitcherAILN from "@/components/buttons/ThemeSwitcherAILN";
import ProjectJumpBackInCardAILN from "@/components/cards/ProjectJumpBackInCardAILN";
import { LogoAileneAILN } from "@/components/elements/LogoAileneAILN";
import { DeleteSession } from "@/lib/actions";
import { LOGIN_URL } from "@/lib/config";
import { ArrowRight, BookOpen, Layers3, LifeBuoy, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function HomeAILN({ session }: { session: LmsSession }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, project_access: projects } = session;
  const firstName = user.full_name.trim().split(/\s+/)[0] || "teman";
  const singleProject = projects.length === 1 ? projects[0] : null;

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await DeleteSession();
      router.push(LOGIN_URL);
      router.refresh();
    } catch {
      toast.error("Gagal logout. Coba lagi.");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-dashboard-bg text-foreground">
      <a
        href="#home-content"
        className="sr-only z-50 rounded-lg bg-forest-deep p-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Langsung ke program
      </a>
      <header className="border-b border-dashboard-border bg-card-1">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Ailene AI Learn — beranda"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
          >
            <LogoAileneAILN className="h-7 w-auto" />
            <span className="hidden border-l border-dashboard-border pl-3 text-xs text-muted-foreground sm:block">
              AI Learn
            </span>
          </Link>
          <div className="flex-1" />
          <Link
            href="/docs"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-claude"
          >
            <BookOpen className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Panduan LMS</span>
            <span className="sr-only sm:hidden">Panduan LMS</span>
          </Link>
          <ThemeSwitcherAILN />
          <ButtonAILN
            variant="ghost"
            size="small"
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label={isLoggingOut ? "Sedang keluar" : "Keluar"}
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </span>
          </ButtonAILN>
        </div>
      </header>
      <main
        id="home-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        <div className="mb-8 flex items-start justify-between gap-5 sm:mb-10">
          <div>
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              Selamat datang kembali, {firstName}.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
              {singleProject
                ? "Langkah kecil hari ini, cara kerja yang lebih baik esok hari."
                : "Pilih program dan lanjutkan perjalanan penerapan AI-mu."}
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-3 rounded-lg border border-dashboard-border bg-card-1 px-4 py-3 md:flex">
            {user.avatar ? (
              <div className="relative size-9 overflow-hidden rounded-full">
                <Image
                  src={user.avatar}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-stakeholder-student-soft text-sm font-medium text-stakeholder-student-foreground">
                {firstName.slice(0, 1).toLocaleUpperCase("id-ID")}
              </span>
            )}
            <div className="max-w-44">
              <p className="truncate text-sm font-medium">{user.full_name}</p>
              {user.job_title && (
                <p className="truncate text-xs text-muted-foreground">
                  {user.job_title}
                </p>
              )}
            </div>
          </div>
        </div>
        <section aria-labelledby="programs-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="programs-title" className="text-sm font-medium">
              {singleProject ? "Program kamu" : "Program yang kamu ikuti"}
            </h2>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers3 className="size-3.5" aria-hidden="true" />
              {projects.length} program
            </span>
          </div>
          <div
            className={`grid gap-5 ${singleProject ? "grid-cols-1" : "md:grid-cols-2"}`}
          >
            {projects.map((project) => (
              <ProjectJumpBackInCardAILN
                key={project.id}
                project={project}
                featured={!!singleProject}
              />
            ))}
          </div>
        </section>
        <section
          aria-label="Bantuan belajar"
          className="mt-7 flex flex-col gap-4 rounded-lg border border-dashboard-border bg-card-1 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <div className="flex items-start gap-3">
            <LifeBuoy
              className="mt-0.5 size-5 shrink-0 text-stakeholder-student-foreground"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-medium">
                Butuh arah untuk langkah berikutnya?
              </h2>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                Panduan sesi, assessment, dan Use Case selalu bisa kamu buka.
              </p>
            </div>
          </div>
          <Link
            href="/docs"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-dashboard-border px-4 py-2 text-sm font-medium transition-colors hover:bg-card-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
          >
            Buka panduan
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 px-4 pt-1 pb-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <span>Ailene AI Learn</span>
        <span>Belajar yang berdampak pada pekerjaan.</span>
      </footer>
    </div>
  );
}
