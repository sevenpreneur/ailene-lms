"use client";
import { getCoachingNotesReceivedMock } from "@/mock-data/student";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);
dayjs.locale("id");

type CoachingNote = ReturnType<typeof getCoachingNotesReceivedMock>[number];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

export default function CoachingNotesAILN() {
  const notes = getCoachingNotesReceivedMock();

  // Hide the section entirely when the member has no coaching notes yet.
  if (notes.length === 0) return null;

  return (
    <section className="mt-6 flex flex-col gap-4">
      <CoachingNotesHeader />
      <div className="flex flex-col gap-3">
        {notes.map((note) => (
          <CoachingNoteCard key={note.id} note={note} />
        ))}
      </div>
    </section>
  );
}

function CoachingNotesHeader() {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-base font-bold text-foreground">
        Catatan dari Champion
      </h2>
      <p className="text-sm text-muted-foreground">
        Masukan personal dari Champion untuk perjalanan belajarmu
      </p>
    </div>
  );
}

function CoachingNoteCard({ note }: { note: CoachingNote }) {
  const { champion } = note;

  return (
    <article className="flex gap-4 rounded-lg border border-red-100 bg-gradient-to-br from-red-50 via-white to-rose-50/60 p-5 dark:border-red-500/25 dark:from-red-500/10 dark:via-card-1 dark:to-rose-500/10">
      <CoachAvatar name={champion.full_name} src={champion.avatar} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-foreground dark:text-white">
            {champion.full_name}
          </span>
          <span className="rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {champion.role}
          </span>
          <span className="text-xs text-muted-foreground">
            {dayjs(note.created_at).fromNow()}
          </span>
        </div>

        <p className="whitespace-pre-line text-sm leading-6 text-foreground/90 dark:text-gray-200">
          {note.text}
        </p>
      </div>
    </article>
  );
}

function CoachAvatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={44}
        height={44}
        className="size-11 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-400 text-sm font-bold text-white">
      {getInitials(name)}
    </span>
  );
}
