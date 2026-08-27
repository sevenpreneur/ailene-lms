"use client";
import type { CoachingNote } from "@/apis/coaching-notes";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);
dayjs.locale("id");

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

export default function CoachingNotesAILN({
  notes,
}: {
  notes: CoachingNote[];
}) {
  // Hide the section entirely when the member has no coaching notes yet.
  if (notes.length === 0) return null;

  return (
    <section className="mt-6 flex flex-col gap-4">
      <CoachingNotesHeader />
      <div className="flex flex-col gap-3">
        {notes.map((note, i) => (
          <CoachingNoteCard key={`${note.champion.id}-${note.created_at}-${i}`} note={note} />
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
    <article className="flex gap-4 rounded-lg border border-hijau-t bg-gradient-to-br from-hijau-t via-white to-hijau-t/60 p-5 dark:border-claude/25 dark:from-claude/10 dark:via-card-1 dark:to-claude/10">
      <CoachAvatar name={champion.name} src={champion.avatar} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-foreground dark:text-white">
            {champion.name}
          </span>
          <span className="rounded-md border border-hijau-t bg-hijau-t px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-claude dark:border-claude/30 dark:bg-claude/10 dark:text-lime-bright">
            Champion
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
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-claude text-sm font-bold text-white">
      {getInitials(name)}
    </span>
  );
}
