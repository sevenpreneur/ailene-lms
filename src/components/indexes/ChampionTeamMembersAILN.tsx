"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import InputAILN from "@/components/fields/InputAILN";
import SelectAILN from "@/components/fields/SelectAILN";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useState } from "react";

dayjs.extend(relativeTime);

type Member =
  inferRouterOutputs<AppRouter>["ailene"]["list"]["members"]["list"][number];

export const statusMeta: Record<
  "on_track" | "at_risk" | "behind",
  { label: string; cls: string }
> = {
  on_track: {
    label: "On Track",
    cls: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300 dark:border dark:border-green-500/30",
  },
  at_risk: {
    label: "At Risk",
    cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border dark:border-yellow-500/30",
  },
  behind: {
    label: "Behind",
    cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300 dark:border dark:border-red-500/30",
  },
};

export default function ChampionTeamMembersAILN(props: { members: Member[] }) {
  const [statusFilter, setStatusFilter] = useState<
    "" | "on_track" | "at_risk" | "behind"
  >("");
  const [search, setSearch] = useState("");

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

  return (
    <SectionContainerAILN
      title="Team Members"
      headerRight={
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-56">
            <InputAILN
              inputId="team-members-search"
              inputType="text"
              variant="CHAMPION"
              inputPlaceholder="Search member…"
              value={search}
              onInputChange={setSearch}
            />
          </div>
          <div className="w-44">
            <SelectAILN
              selectId="team-members-status"
              variant="CHAMPION"
              selectPlaceholder="Filter Status"
              value={statusFilter}
              onChange={(v) =>
                setStatusFilter((v ?? "") as typeof statusFilter)
              }
              options={[
                { label: "Semua Status", value: "" },
                { label: "On Track", value: "on_track" },
                { label: "At Risk", value: "at_risk" },
                { label: "Behind", value: "behind" },
              ]}
            />
          </div>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-2 font-medium">Member</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Level</th>
              <th className="px-2 py-2 font-medium">Progress</th>
              <th className="px-2 py-2 font-medium">Current Chapter</th>
              <th className="px-2 py-2 font-medium">XP Earned</th>
              <th className="px-2 py-2 font-medium">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-gray-400 dark:text-gray-500"
                >
                  No members found.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr
                  key={m.member_id}
                  className="border-t border-dashboard-border hover:bg-gray-50 dark:hover:bg-card-inside-bg"
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      {m.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.user.avatar}
                          alt={m.user.full_name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-dashboard-border" />
                      )}
                      <div>
                        <Link
                          href={`/champion/members/${m.member_id}`}
                          className="font-semibold text-gray-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300"
                        >
                          {m.user.full_name}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {m.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${statusMeta[m.status].cls}`}
                    >
                      {statusMeta[m.status].label}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1.5">
                      {m.current_level.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.current_level.icon}
                          alt={m.current_level.name}
                          className="h-5 w-5"
                        />
                      )}
                      <span className="text-xs font-medium dark:text-gray-200">
                        Level {m.current_level.level_number}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-xs dark:text-gray-300">
                        {m.progress_percent}%
                      </span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-dashboard-border">
                        <div
                          className="h-full bg-[#107158] dark:bg-emerald-500 dark:shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                          style={{ width: `${m.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-xs dark:text-gray-300">
                    {m.current_chapter?.name ?? (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-2 py-3 font-semibold dark:text-white">
                    {m.total_xp.toLocaleString()} XP
                  </td>
                  <td className="px-2 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {m.last_active_at
                      ? dayjs(m.last_active_at).fromNow()
                      : "Never"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionContainerAILN>
  );
}
