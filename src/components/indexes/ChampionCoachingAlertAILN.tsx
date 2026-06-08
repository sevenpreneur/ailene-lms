"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { statusMeta } from "@/components/indexes/ChampionTeamMembersAILN";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type Member =
  inferRouterOutputs<AppRouter>["ailene"]["list"]["members"]["list"][number];

export default function ChampionCoachingAlertAILN(props: {
  members: Member[];
}) {
  const alerts = props.members.filter(
    (m) => m.status === "at_risk" || m.status === "behind"
  );

  return (
    <SectionContainerAILN
      title="Coaching Alerts"
      headerRight={
        alerts.length > 0 ? (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/15 dark:text-red-300 dark:border dark:border-red-500/30">
            {alerts.length} perlu perhatian
          </span>
        ) : undefined
      }
    >
      {alerts.length === 0 ? (
        <div className="text-sm text-gray-400 dark:text-gray-500">
          No alerts. Everyone&apos;s on track 🎉
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((m) => (
            <div
              key={m.member_id}
              className="rounded-lg border border-dashboard-border bg-gray-50 p-3 dark:bg-card-inside-bg"
            >
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold dark:text-white">
                      {m.user.full_name}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${statusMeta[m.status].cls}`}
                    >
                      {statusMeta[m.status].label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {m.last_active_at
                      ? `Last active ${dayjs(m.last_active_at).fromNow()}`
                      : "Never active"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionContainerAILN>
  );
}
