"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import InputAILN from "@/components/fields/InputAILN";
import MemberDetailPanelChampionAILN from "@/components/indexes/MemberDetailPanelChampionAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { setSessionToken, trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import { Search } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

type Member = inferRouterOutputs<AppRouter>["list"]["members"]["list"][number];

const STATUS_META: Record<
  Member["status"],
  { label: string; dot: string; text: string }
> = {
  on_track: {
    label: "Sesuai target",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  at_risk: {
    label: "Perlu perhatian",
    dot: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-300",
  },
  behind: {
    label: "Tertinggal",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
};

export default function MembersChampionAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedParam = Number(searchParams.get("member_id")) || null;

  const [levelFilter, setLevelFilter] = useState<number | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const membersQ = trpc.list.members.useQuery({});
  const members = membersQ.data?.list ?? [];
  const levelsQ = trpc.list.levels.useQuery();
  const levelTable = levelsQ.data?.list ?? [];

  const selectMember = (id: number) => {
    router.replace(`${pathname}?member_id=${id}`, { scroll: false });
  };

  // Member count per level — pills themselves come from the level table.
  const levelCounts = new Map<number, number>();
  for (const m of members) {
    const lvl = m.current_level.level_number;
    levelCounts.set(lvl, (levelCounts.get(lvl) ?? 0) + 1);
  }

  const filtered = members.filter((m) => {
    if (levelFilter !== "ALL" && m.current_level.level_number !== levelFilter)
      return false;
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

  // Default selection: URL param if valid, otherwise first member in the list.
  const selectedId =
    selectedParam && members.some((m) => m.member_id === selectedParam)
      ? selectedParam
      : (members[0]?.member_id ?? null);

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Detail Anggota"
          desc="Pilih anggota untuk melihat kompetensi, breakdown, dan kirim catatan coaching."
        />
        {membersQ.error ? (
          <AppErrorComponents />
        ) : (
          <>
            {/* Row 2: filter + search (full width) */}
            <div className="flex w-full justify-between items-center gap-4">
              {/* Level filter */}
              <div className="flex flex-wrap items-center gap-2">
                <LevelPill
                  active={levelFilter === "ALL"}
                  label="Semua"
                  count={members.length}
                  onClick={() => setLevelFilter("ALL")}
                />
                {levelTable.map((lvl) => (
                  <LevelPill
                    key={lvl.id}
                    active={levelFilter === lvl.level_number}
                    label={`Level ${lvl.level_number}`}
                    count={levelCounts.get(lvl.level_number) ?? 0}
                    onClick={() => setLevelFilter(lvl.level_number)}
                  />
                ))}
              </div>

              {/* Search */}
              <InputAILN
                inputId="member-search"
                inputType="text"
                variant="CHAMPION"
                inputIcon={<Search className="size-4" />}
                inputPlaceholder="Cari anggota…"
                value={search}
                onInputChange={setSearch}
              />
            </div>

            {/* Row 3: table (left) + detail (right) */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* Left: member table — sticky, follows the detail panel height */}
              <div className="xl:sticky xl:top-6 xl:self-start">
                <SectionContainerAILN
                  title="Anggota Tim"
                  contentClassName="-mx-5 -mb-5 overflow-hidden"
                >
                  {membersQ.isLoading ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-400">
                      Memuat…
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-400">
                      Tidak ada anggota ditemukan.
                    </div>
                  ) : (
                    <div className="max-h-[calc(100dvh-15rem)] overflow-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            <th className="sticky top-0 z-10 border-y border-dashboard-border bg-card-2 px-5 py-2.5">
                              Anggota
                            </th>
                            <th className="sticky top-0 z-10 border-y border-dashboard-border bg-card-2 px-3 py-2.5">
                              Level
                            </th>
                            <th className="sticky top-0 z-10 border-y border-dashboard-border bg-card-2 px-3 py-2.5">
                              Progress
                            </th>
                            <th className="sticky top-0 z-10 border-y border-dashboard-border bg-card-2 px-3 py-2.5">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((m) => (
                            <MemberRow
                              key={m.member_id}
                              member={m}
                              selected={m.member_id === selectedId}
                              onClick={() => selectMember(m.member_id)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SectionContainerAILN>
              </div>

              {/* Right: selected member detail */}
              <div>
                {selectedId ? (
                  <MemberDetailPanelChampionAILN
                    key={selectedId}
                    memberId={selectedId}
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-dashboard-border text-sm text-gray-500 dark:text-gray-400">
                    Pilih anggota untuk melihat detail.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainerAILN>
  );
}

function LevelPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-300"
          : "border-dashboard-border text-gray-600 hover:border-gray-400 dark:text-gray-300"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${
          active ? "bg-emerald-600" : "bg-gray-400 dark:bg-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function MemberRow({
  member,
  selected,
  onClick,
}: {
  member: Member;
  selected: boolean;
  onClick: () => void;
}) {
  const status = STATUS_META[member.status];
  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer border-b border-dashboard-border transition ${
        selected ? "bg-emerald-500/[0.06]" : "hover:bg-emerald-500/[0.04]"
      }`}
    >
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Image
            src={member.user.avatar || DEFAULT_AVATAR}
            alt={member.user.full_name}
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {member.user.full_name}
            </div>
            <div className="truncate text-xs font-inter text-gray-500 dark:text-gray-400">
              {member.user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <GeneralLabelAILN variant="blue">
          Level {member.current_level.level_number}
        </GeneralLabelAILN>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${member.progress_percent}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
            {member.progress_percent}%
          </span>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={`size-1.5 shrink-0 rounded-full ${status.dot}`} />
          <span className={`text-xs font-semibold ${status.text}`}>
            {status.label}
          </span>
        </div>
      </td>
    </tr>
  );
}
