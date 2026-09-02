"use client";
import AIWorkspacePanelAILN from "@/components/cards/AIWorkspacePanelAILN";
import DisabledActionButtonAILN from "@/components/buttons/DisabledActionButtonAILN";
import DiscoverySidebarAILN from "@/components/navigations/DiscoverySidebarAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import type { LmsSession } from "@/apis/auth";
import type { ProgramPreviewMock } from "@/mock-data/explore";
import {
  Check,
  CheckCircle2,
  Link2,
  Lock,
  MapPin,
  PlayCircle,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-dashboard-border bg-card-1 p-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

const MODULE_ICON = {
  done: <CheckCircle2 size={16} className="shrink-0 text-claude dark:text-lime-bright" />,
  current: <PlayCircle size={16} className="shrink-0 text-claude dark:text-lime-bright" />,
  locked: <Lock size={13} className="shrink-0 text-muted-foreground" />,
};

function SessionMedia({ program }: { program: ProgramPreviewMock }) {
  const [activeChapterId, setActiveChapterId] = useState(program.chapters[0]?.id);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const query = search.trim().toLowerCase();
  const visible = query
    ? program.transcript.filter(
        (line) =>
          line.text.toLowerCase().includes(query) ||
          line.speaker.toLowerCase().includes(query)
      )
    : program.transcript;

  async function copyTimestampLink(time: number, id: string) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#t=${time}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-dashboard-border bg-card-1 p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Video sesi
          </h2>
          <p className="text-sm text-muted-foreground">
            Tonton video-nya, lalu lompat ke bagian materi yang kamu mau.
          </p>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${program.videoId}`}
            title={program.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {program.chapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => setActiveChapterId(chapter.id)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                activeChapterId === chapter.id
                  ? "border-claude bg-hijau-t text-claude dark:border-lime-bright/60 dark:bg-claude/15 dark:text-lime-bright"
                  : "border-dashboard-border text-muted-foreground hover:bg-dashboard-bg"
              }`}
            >
              <span className="font-mono text-[11px] opacity-70">
                {formatTime(chapter.start)}–{formatTime(chapter.end)}
              </span>{" "}
              <span>{chapter.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashboard-border bg-card-1 p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Transcript</h2>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transcript"
              className="w-52 rounded-lg border border-dashboard-border bg-background py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-claude/40"
            />
          </div>
        </div>

        <div className="flex max-h-96 flex-col gap-1 overflow-y-auto pr-1">
          {visible.map((line) => (
            <div
              key={line.id}
              className={`group/row flex gap-3 rounded-lg px-2.5 py-2.5 transition-colors ${
                line.chapterId === activeChapterId && !query
                  ? "bg-hijau-t/60 dark:bg-claude/10"
                  : "hover:bg-dashboard-bg"
              }`}
            >
              <span className="w-10 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
                {formatTime(line.time)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground/70">
                  {line.speaker}
                </p>
                <p className="text-sm text-foreground">{line.text}</p>
              </div>
              <button
                type="button"
                aria-label="Salin link timestamp"
                onClick={() => copyTimestampLink(line.time, line.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-dashboard-border/60 hover:text-foreground group-hover/row:opacity-100"
              >
                {copiedId === line.id ? (
                  <Check size={15} className="text-claude dark:text-lime-bright" />
                ) : (
                  <Link2 size={15} />
                )}
              </button>
            </div>
          ))}

          {visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nggak ada transcript yang cocok dengan pencarianmu.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProgramPreviewAILN({
  session,
  program,
}: {
  session: LmsSession;
  program: ProgramPreviewMock;
}) {
  const firstName =
    session.user.full_name.split(" ")[0] ?? session.user.full_name;

  return (
    <>
      <DiscoverySidebarAILN session={session} />
      <PageContainerAILN>
        <div className="flex w-full flex-col gap-6">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-claude hover:underline dark:hover:text-lime-bright"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground/70">{program.name}</span>
          </nav>

          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground">
              <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-dashboard-border">
                <Image
                  src={program.logo}
                  alt={program.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </span>
              by {program.name} · {program.sessionLabel}
            </div>

            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {program.name}
            </h1>

            <p className="max-w-2xl text-muted-foreground">{program.tagline}</p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-dashboard-border bg-dashboard-bg px-2.5 py-0.5 text-xs font-medium text-foreground">
                {program.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={12} />
                {program.location}
              </span>
              <DisabledActionButtonAILN size="small" className="ml-1">
                Ajukan Akses
              </DisabledActionButtonAILN>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
            <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
              <SessionMedia program={program} />

              <Section title="Tentang Program">
                <div className="flex flex-col gap-3">
                  {program.about.map((p, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </Section>

              <Section title="Yang Akan Dipelajari">
                <div className="flex flex-col gap-3">
                  {program.whatYoullLearn.map((item) => (
                    <p
                      key={item.title}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      <strong className="font-semibold text-foreground">
                        {item.title}
                      </strong>{" "}
                      — {item.body}
                    </p>
                  ))}
                </div>
              </Section>

              <Section title="Untuk Siapa Program Ini?">
                <ul className="list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
                  {program.whoIsThisFor.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </Section>
            </div>

            <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
              <AIWorkspacePanelAILN firstName={firstName} />

              <div className="rounded-2xl border border-dashboard-border bg-card-1 p-5">
                <h2 className="mb-1 text-sm font-semibold text-foreground">
                  Materi lainnya
                </h2>
                <p className="mb-3 text-xs text-muted-foreground">
                  Modul lain di program ini.
                </p>
                <div className="flex flex-col gap-1">
                  {program.modules.map((module, index) => (
                    <div
                      key={module.id}
                      className={`flex items-center gap-3 rounded-lg p-2 ${
                        module.status === "current" ? "bg-hijau-t/60 dark:bg-claude/10" : ""
                      }`}
                    >
                      <span className="w-4 shrink-0 text-center text-[11px] font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-sm ${
                          module.status === "locked"
                            ? "text-muted-foreground"
                            : "font-medium text-foreground"
                        }`}
                      >
                        {module.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {module.duration}
                      </span>
                      {MODULE_ICON[module.status]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainerAILN>
    </>
  );
}
