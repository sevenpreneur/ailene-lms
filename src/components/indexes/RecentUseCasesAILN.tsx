"use client";
import { trpc } from "@/trpc/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

dayjs.extend(relativeTime);

// Use Case Terbaru — 3 submission use case terakhir dari tim champion (data nyata
// via list.useCaseSubmissions). Selaras dengan kartu "Use Case Terbaru" di lms-fe.
export default function RecentUseCasesAILN() {
  const q = trpc.ailene.list.useCaseSubmissions.useQuery();

  const items = (q.data?.list ?? [])
    .filter((r) => r.submitted_at)
    .sort(
      (a, b) =>
        new Date(b.submitted_at!).getTime() -
        new Date(a.submitted_at!).getTime()
    )
    .slice(0, 3);

  return (
    <section className="rounded-xl border border-dashboard-border bg-white p-5 shadow-sm dark:bg-card-1">
      <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
        Use Case Terbaru
      </h3>

      {q.isLoading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded bg-gray-100 dark:bg-dashboard-border"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Belum ada use case dikirim.
        </p>
      ) : (
        <div className="space-y-2.5">
          {items.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {r.use_case.name}
                </p>
                <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                  oleh {r.member.full_name}
                  {r.use_case.level ? ` · L${r.use_case.level.level_number}` : ""}
                  {r.is_accepted ? " · diterima" : " · menunggu review"}
                </p>
              </div>
              <span className="mt-0.5 shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                {dayjs(r.submitted_at).fromNow()}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/champion/submissions/use-cases"
        className="mt-4 block rounded-lg border border-dashboard-border py-2 text-center text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
      >
        Lihat semua use case
      </Link>
    </section>
  );
}
