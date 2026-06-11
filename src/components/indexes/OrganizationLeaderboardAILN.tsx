"use client";
import type React from "react";
import { trpc } from "@/trpc/client";
import Link from "next/link";

// Medal colors for the podium (rank 1–3); the rest stay neutral so the top
// performers pop with warmth instead of a uniform blue bar.
function rankStyle(rank: number): { chip: string; bar: string } {
  switch (rank) {
    case 1:
      return {
        chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
        bar: "#f59e0b",
      };
    case 2:
      return {
        chip: "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
        bar: "#94a3b8",
      };
    case 3:
      return {
        chip: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
        bar: "#fb923c",
      };
    default:
      return {
        chip: "bg-muted text-muted-foreground",
        bar: "var(--chart-3)",
      };
  }
}

export default function OrganizationLeaderboardAILN() {
 const q = trpc.ailene.read.organizationLeaderboard.useQuery();

 if (q.isLoading) {
 return (
 <Shell>
 <div className="h-40 animate-pulse rounded-md bg-muted" />
 </Shell>
 );
 }

 if (q.error || !q.data) {
 return (
 <Shell>
 <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
 Gagal memuat top departemen.
 </div>
 </Shell>
 );
 }

 const maxHours = Math.max(...q.data.list.map((item) => item.hours), 1);

 return (
 <Shell>
 <div>
 <div className="text-base font-bold text-foreground">
 Top Departemen
 </div>
 <p className="mt-0.5 text-xs text-muted-foreground">
 by total jam dihemat
 </p>
 </div>

 {q.data.list.length === 0 ? (
 <div className="mt-3 flex h-32 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground dark:bg-card-2 dark:text-muted-foreground">
 Belum ada use case yang tersubmit.
 </div>
 ) : (
 <ul className="mt-3 flex flex-col gap-2.5 text-sm">
 {q.data.list.map((department) => {
 const widthPct = (department.hours / maxHours) * 100;
 const style = rankStyle(department.rank);

 return (
 <li
 key={department.id}
 className="rounded-md transition hover:bg-muted dark:hover:bg-card-2"
 >
 <Link
 href={`/sponsor/groups/${department.id}`}
 className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-1.5"
 >
 <span
 className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${style.chip}`}
 >
 {department.rank}
 </span>
 <div className="min-w-0">
 <div className="truncate font-medium text-foreground">
 {department.name}
 </div>
 <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
 <div
 className="h-full rounded-full"
 style={{
 width: `${widthPct}%`,
 backgroundColor: style.bar,
 }}
 />
 </div>
 </div>
 <span className="text-sm font-semibold text-foreground">
 {department.hours.toLocaleString("id-ID", {
 maximumFractionDigits: 1,
 })}
 j
 </span>
 </Link>
 </li>
 );
 })}
 </ul>
 )}
 </Shell>
 );
}

function Shell({ children }: { children: React.ReactNode }) {
 return (
 <div className="ailn-card p-5">
 {children}
 </div>
 );
}
