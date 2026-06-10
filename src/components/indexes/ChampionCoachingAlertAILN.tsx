"use client";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowRight, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);

type Member =
  inferRouterOutputs<AppRouter>["ailene"]["list"]["members"]["list"][number];

const AVATAR_GRADIENTS = [
  "from-fuchsia-500 to-pink-500",
  "from-sky-500 to-blue-500",
  "from-emerald-500 to-green-500",
  "from-orange-500 to-red-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-teal-500",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

// Auto-generated talking point from the data we have on the member, plus an
// optional pairing suggestion with the strongest on-track peer (a "mentor").
function buildTalkingPoint(m: Member, mentor: Member | null): string {
  const lvl = m.current_level.level_number;
  const uc = m.use_case_count;
  const lastActive = m.last_active_at
    ? dayjs(m.last_active_at).fromNow()
    : "belum pernah aktif";

  const head =
    m.status === "behind"
      ? `Tertahan di L${lvl}, baru ${uc} use case · terakhir aktif ${lastActive}.`
      : `Mulai melambat di L${lvl}, ${uc} use case · terakhir aktif ${lastActive}.`;

  if (mentor && mentor.member_id !== m.member_id) {
    return `${head} Talking point: pasangkan dengan ${firstName(
      mentor.user.full_name
    )} (L${mentor.current_level.level_number}).`;
  }
  return head;
}

function CoachAvatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={28}
        height={28}
        unoptimized
        className="size-7 shrink-0 rounded-full object-cover"
      />
    );
  }
  const gradient = AVATAR_GRADIENTS[hashString(name) % AVATAR_GRADIENTS.length];
  return (
    <div
      className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-bold text-white`}
    >
      {getInitials(name)}
    </div>
  );
}

export default function ChampionCoachingAlertAILN(props: {
  members: Member[];
}) {
  const alerts = props.members.filter(
    (m) => m.status === "at_risk" || m.status === "behind"
  );

  // Strongest on-track member → suggested mentor to pair struggling members with.
  const mentor =
    [...props.members]
      .filter((m) => m.status === "on_track")
      .sort(
        (a, b) =>
          b.current_level.level_number - a.current_level.level_number ||
          b.use_case_count - a.use_case_count
      )[0] ?? null;

  const hasAlerts = alerts.length > 0;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/25 dark:bg-amber-500/5">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <Eye className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold leading-snug text-amber-900 dark:text-amber-200">
            {hasAlerts
              ? `${alerts.length} anggota perlu coaching minggu ini`
              : "Semua anggota on track minggu ini"}
          </h2>
          <p className="text-xs text-amber-700/80 dark:text-amber-300/70">
            {hasAlerts
              ? "Talking points sudah otomatis disiapkan"
              : "Tidak ada yang perlu intervensi 🎉"}
          </p>
        </div>
      </div>

      {/* Alert cards */}
      {hasAlerts && (
        <div className="flex max-h-[560px] flex-col gap-3 overflow-y-auto">
          {alerts.map((m) => (
            <div
              key={m.member_id}
              className="flex flex-col gap-2.5 rounded-lg border border-amber-100 bg-white p-3 dark:border-amber-500/15 dark:bg-card-bg"
            >
              <div className="flex items-center gap-2">
                <CoachAvatar name={m.user.full_name} src={m.user.avatar} />
                <span className="truncate text-xs font-bold text-gray-900 dark:text-white">
                  {m.user.full_name}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                {buildTalkingPoint(m, mentor)}
              </p>
              <Link
                href={`/champion/members/${m.member_id}`}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
              >
                Buka 1:1 prep brief
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
