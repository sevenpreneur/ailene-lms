"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { useProjectId } from "@/lib/use-project-id";
import { getUseCaseSubmissionsMock } from "@/mock-data/champion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

dayjs.extend(relativeTime);

export default function RecentUseCasesAILN() {
  const projectId = useProjectId();

  const items = getUseCaseSubmissionsMock()
    .filter((r) => r.submitted_at)
    .sort(
      (a, b) =>
        new Date(b.submitted_at!).getTime() -
        new Date(a.submitted_at!).getTime()
    )
    .slice(0, 3);

  return (
    <SectionContainerAILN title="Use Case Terbaru">
      {items.length === 0 ? (
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
                  {r.use_case.level
                    ? ` · L${r.use_case.level.level_number}`
                    : ""}
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
        href={`/${projectId}/champion/submissions/use-cases`}
        className="mt-4 block rounded-lg border border-dashboard-border py-2 text-center text-xs font-semibold text-claude transition hover:bg-hijau-t dark:text-lime-bright dark:hover:bg-claude/10"
      >
        Lihat semua use case
      </Link>
    </SectionContainerAILN>
  );
}
