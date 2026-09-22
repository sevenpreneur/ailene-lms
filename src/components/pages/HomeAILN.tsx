"use client";
import type { LmsSession } from "@/apis/auth";
import ProjectJumpBackInCardAILN from "@/components/cards/ProjectJumpBackInCardAILN";
import ThemeSwitcherAILN from "@/components/buttons/ThemeSwitcherAILN";
import { LogoAileneAILN } from "@/components/elements/LogoAileneAILN";
import { DeleteSession } from "@/lib/actions";
import { LOGIN_URL } from "@/lib/config";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

dayjs.locale("id");

const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

// Greeting follows the viewer's own clock, so it has to be picked on the client.
function greetingFor(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default function HomeAILN({ session }: { session: LmsSession }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = session.user;
  const firstName = user.full_name.split(" ")[0];
  const projects = session.project_access;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await DeleteSession();
      router.push(LOGIN_URL);
    } catch {
      toast.error("Gagal logout. Coba lagi.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-dashboard-bg">
      <header className="sticky top-0 z-10 border-b border-dashboard-border bg-card-1/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 md:px-6">
          <LogoAileneAILN className="h-7 w-auto text-foreground" />
          <div className="flex-1" />
          <ThemeSwitcherAILN />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Logout"
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-dashboard-bg hover:text-foreground disabled:opacity-60"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-6 md:py-14">
        <section className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-dashboard-border bg-card-1 sm:h-16 sm:w-16">
            <Image
              src={user.avatar || DEFAULT_AVATAR}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {greetingFor(dayjs().hour())}, {firstName}
            </h1>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {dayjs().format("dddd, D MMMM YYYY")}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Program yang sedang berjalan
            </h2>
            <span className="shrink-0 text-sm text-muted-foreground">
              {projects.length} program
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectJumpBackInCardAILN key={project.id} project={project} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
