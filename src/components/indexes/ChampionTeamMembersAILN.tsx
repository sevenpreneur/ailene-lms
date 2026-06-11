"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronRight, ListFilter, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

dayjs.extend(relativeTime);

type Member =
  inferRouterOutputs<AppRouter>["ailene"]["list"]["members"]["list"][number];

type StatusKey = "on_track" | "at_risk" | "behind";

export const statusMeta: Record<
  StatusKey,
  { label: string; short: string; dot: string; text: string; cls: string }
> = {
  on_track: {
    label: "Sesuai target",
    short: "On Track",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    cls: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300 dark:border dark:border-green-500/30",
  },
  at_risk: {
    label: "Perlu perhatian",
    short: "At Risk",
    dot: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border dark:border-yellow-500/30",
  },
  behind: {
    label: "Tertinggal · perlu coaching",
    short: "Behind",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300 dark:border dark:border-red-500/30",
  },
};

// Level pill accent rotates by level number so each level reads distinctly.
const LEVEL_STYLES = [
  "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
  "border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300",
  "border-violet-300 text-violet-700 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300",
  "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
];

// Deterministic avatar gradient from the member's name.
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

function MemberAvatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={36}
        height={36}
        unoptimized
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  const gradient = AVATAR_GRADIENTS[hashString(name) % AVATAR_GRADIENTS.length];
  return (
    <div
      className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-xs font-bold text-white`}
    >
      {getInitials(name)}
    </div>
  );
}

export default function ChampionTeamMembersAILN(props: { members: Member[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"" | StatusKey>("");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [filterOpen]);

  const filtered = props.members.filter((m) => {
    if (statusFilter && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !m.user.full_name.toLowerCase().includes(q) &&
        !m.user.email.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const filterOptions: { label: string; value: "" | StatusKey }[] = [
    { label: "Semua Status", value: "" },
    { label: "Sesuai target", value: "on_track" },
    { label: "Perlu perhatian", value: "at_risk" },
    { label: "Tertinggal", value: "behind" },
  ];

  return (
    <SectionContainerAILN
      title="Anggota Tim Langsung"
      desc="Klik baris untuk melihat detail member · Sortir: Status"
      contentClassName="overflow-visible"
      headerRight={
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari anggota…"
              className="h-10 w-full rounded-lg border border-dashboard-border bg-white pl-9 pr-3 text-sm text-foreground placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none dark:bg-card-1 dark:text-gray-200"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                statusFilter
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-dashboard-border bg-white text-foreground hover:border-foreground/40 dark:bg-card-1 dark:text-gray-200"
              }`}
            >
              <ListFilter className="size-4" />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-lg border border-dashboard-border bg-white py-1 shadow-lg dark:bg-card-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value || "all"}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-card-2 ${
                      statusFilter === opt.value
                        ? "font-semibold text-emerald-700 dark:text-emerald-300"
                        : "text-foreground dark:text-gray-200"
                    }`}
                  >
                    {opt.label}
                    {statusFilter === opt.value && (
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      }
    >
      {/* max-height + scroll: kalau anggota banyak, tabel scroll (tidak melebihi
          kolom kanan). Header sticky biar tetap terlihat saat scroll. */}
      <div className="max-h-[460px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <th className="sticky top-0 z-10 border-y border-dashboard-border bg-gray-50 px-4 py-2.5 dark:bg-card-2">Anggota</th>
              <th className="sticky top-0 z-10 border-y border-dashboard-border bg-gray-50 px-4 py-2.5 dark:bg-card-2">Level</th>
              <th className="sticky top-0 z-10 border-y border-dashboard-border bg-gray-50 px-4 py-2.5 text-center dark:bg-card-2">Use Case</th>
              <th className="sticky top-0 z-10 border-y border-dashboard-border bg-gray-50 px-4 py-2.5 dark:bg-card-2">Status</th>
              <th className="sticky top-0 z-10 border-y border-dashboard-border bg-gray-50 px-4 py-2.5 text-right dark:bg-card-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-400 dark:text-gray-500"
                >
                  Tidak ada anggota ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const status = statusMeta[m.status];
                const levelCls =
                  LEVEL_STYLES[
                    (m.current_level.level_number - 1 + LEVEL_STYLES.length) %
                      LEVEL_STYLES.length
                  ];
                const href = `/champion/members/${m.member_id}`;
                return (
                  <tr
                    key={m.member_id}
                    onClick={() => router.push(href)}
                    className="group cursor-pointer border-b border-dashboard-border transition hover:bg-gray-50 dark:hover:bg-card-2"
                  >
                    {/* Anggota */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <MemberAvatar
                          name={m.user.full_name}
                          src={m.user.avatar}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {m.user.full_name}
                          </div>
                          <div className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                            {m.user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${levelCls}`}
                      >
                        L{m.current_level.level_number}
                      </span>
                    </td>

                    {/* Use Case */}
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {m.use_case_count}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${status.dot}`}
                        />
                        <span className={`text-xs font-semibold ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                          m.status === "behind"
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-emerald-700 dark:text-emerald-300"
                        } group-hover:underline`}
                      >
                        Lihat detail
                        <ChevronRight className="size-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </SectionContainerAILN>
  );
}
