"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { getGroupLeaderboardMock } from "@/mock-data/student";
import { Lock } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const DEFAULT_AVATAR =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur//default-avatar.svg.png";

type LeaderboardTab = "DEPT" | "ANGKATAN" | "TIM";

export default function LeaderboardPanelStudentAILN() {
  const [tab, setTab] = useState<LeaderboardTab>("DEPT");
  const data = getGroupLeaderboardMock();

  const tabs: { key: LeaderboardTab; label: string; enabled: boolean }[] = [
    { key: "DEPT", label: "Departemen", enabled: true },
    { key: "ANGKATAN", label: "Angkatan", enabled: false },
    { key: "TIM", label: "Tim", enabled: false },
  ];

  return (
    <SectionContainerAILN
      title="Leaderboard"
      desc="Peringkat kontribusi XP."
      headerRight={
        tab === "DEPT" && data.group ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
              #{data.my_rank}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              dari {data.total}
            </span>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col">
        {/* Tabs */}
        <div className="inline-flex w-fit rounded-md border border-dashboard-border p-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              disabled={!t.enabled}
              onClick={() => t.enabled && setTab(t.key)}
              className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition ${
                tab === t.key
                  ? "bg-black text-white dark:bg-red-500/20 dark:text-red-100"
                  : t.enabled
                    ? "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    : "cursor-not-allowed text-gray-300 dark:text-gray-600"
              }`}
            >
              {t.label}
              {!t.enabled && <Lock className="size-3" />}
            </button>
          ))}
        </div>

        <div className="mt-4 flex-1">
          {tab !== "DEPT" ? (
            <Placeholder />
          ) : !data.group || data.leaderboard.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Kamu belum tergabung dalam group manapun.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {data.leaderboard.map((entry) => (
                <div
                  key={entry.member_id}
                  className={`flex items-center gap-3 rounded-md px-2.5 py-2 ${
                    entry.is_me
                      ? "bg-red-50 font-semibold text-gray-900 dark:bg-red-500/15 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(239,68,68,0.4)]"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span
                    className={`w-5 shrink-0 text-center text-sm font-semibold ${
                      entry.is_me
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <Image
                    src={entry.avatar || DEFAULT_AVATAR}
                    alt=""
                    width={32}
                    height={32}
                    className={`size-8 rounded-full object-cover ${
                      entry.is_me ? "dark:ring-1 dark:ring-red-500/50" : ""
                    }`}
                  />
                  <span className="flex-1 truncate text-sm">
                    {entry.full_name}
                    {entry.is_me && (
                      <span className="ml-1.5 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        ANDA
                      </span>
                    )}
                  </span>
                  <span className="shrink-0  text-xs text-gray-500 dark:text-gray-400">
                    {entry.total_xp.toLocaleString("id-ID")} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionContainerAILN>
  );
}

function Placeholder() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border py-12 text-center">
      <Lock className="size-6 text-gray-400 dark:text-gray-500" />
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Segera hadir
      </div>
    </div>
  );
}
