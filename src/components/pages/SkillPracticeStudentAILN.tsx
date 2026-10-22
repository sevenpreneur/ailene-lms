"use client";

import type { AssignedUseCase, GuidedSession } from "@/apis/use-cases";
import GuidedSessionCardAILN from "@/components/cards/GuidedSessionCardAILN";
import RecordUseCaseButtonAILN from "@/components/buttons/RecordUseCaseButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import SkillPracticeCardAILN from "@/components/items/SkillPracticeCardAILN";
import Tabs from "@/components/navigations/Tabs";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import LoadErrorAILN from "@/components/states/LoadErrorAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import dayjs from "dayjs";
import { BookOpen, Clock, History } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PracticeTab = "ASSIGNED" | "HISTORY";

function deriveStatus(item: AssignedUseCase) {
  if (item.is_accepted) return "ACCEPTED" as const;
  if (!item.submitted_at) return "PENDING_SUBMIT" as const;
  if (
    item.reviewed_at &&
    dayjs(item.reviewed_at).isAfter(dayjs(item.submitted_at))
  ) {
    return "NEEDS_REVISION" as const;
  }
  return "AWAITING_REVIEW" as const;
}

export default function SkillPracticeStudentAILN({
  assignedUseCases,
  assignedFailed = false,
  personalSession = null,
  personalFailed = false,
}: {
  assignedUseCases: AssignedUseCase[];
  assignedFailed?: boolean;
  personalSession?: GuidedSession | null;
  personalFailed?: boolean;
}) {
  const projectId = useProjectId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab: PracticeTab =
    searchParams.get("tab") === "history" ? "HISTORY" : "ASSIGNED";

  const assignedItems = [...assignedUseCases].sort((a, b) => {
    const statusOrder =
      Number(a.is_accepted) - Number(b.is_accepted) ||
      Number(Boolean(a.submitted_at)) - Number(Boolean(b.submitted_at));
    return (
      statusOrder ||
      dayjs(a.deadline_at ?? "9999-12-31").valueOf() -
        dayjs(b.deadline_at ?? "9999-12-31").valueOf()
    );
  });
  const historyItems = assignedItems.filter((item) => item.submitted_at);
  const pendingCount = assignedItems.filter(
    (item) => deriveStatus(item) === "PENDING_SUBMIT",
  ).length;
  const shown = tab === "HISTORY" ? historyItems : assignedItems;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Latihan AI"
          desc="Terapkan AI di pekerjaanmu lewat Use Case terpandu."
        >
          <RecordUseCaseButtonAILN projectId={projectId} />
        </PageHeaderAILN>
        <Tabs<PracticeTab>
          ariaLabel="Bagian latihan AI"
          value={tab}
          onValueChange={(value) => {
            const query = value === "HISTORY" ? "?tab=history" : "";
            router.push(`${pathname}${query}`, { scroll: false });
          }}
          items={[
            {
              value: "ASSIGNED",
              label: "Untukmu",
              icon: <Clock className="size-4" />,
              badge: pendingCount || null,
            },
            {
              value: "HISTORY",
              label: "Riwayat",
              icon: <History className="size-4" />,
            },
          ]}
        />
        {tab === "ASSIGNED" && (personalSession || personalFailed) && (
          <SectionContainerAILN
            title="Lanjutkan Use Case"
            contentClassName="flex flex-col gap-4"
          >
            {personalFailed ? (
              <LoadErrorAILN message="Catatan pribadimu belum dapat dimuat. Coba lagi untuk melanjutkan." />
            ) : (
              personalSession && (
                <GuidedSessionCardAILN
                  session={personalSession}
                  projectId={projectId}
                />
              )
            )}
          </SectionContainerAILN>
        )}
        <SectionContainerAILN
          title={tab === "HISTORY" ? "Riwayat tugas terpandu" : "Untukmu"}
          contentClassName="flex flex-col gap-4"
        >
          {assignedFailed ? (
            <LoadErrorAILN message="Tugas terpandu belum dapat dimuat. Kamu tetap bisa mencatat Use Case sendiri." />
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border py-12 text-center text-gray-500 dark:text-gray-400">
              <BookOpen className="size-6" />
              <p className="text-sm">
                {tab === "HISTORY"
                  ? "Belum ada tugas terpandu yang dikirim."
                  : "Belum ada tugas terpandu untukmu."}
              </p>
            </div>
          ) : (
            <>
              {tab === "ASSIGNED" && pendingCount > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  <strong>{pendingCount}</strong> use case belum dikerjakan.
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {shown.map((item) => (
                  <SkillPracticeCardAILN
                    key={item.id}
                    title={item.name}
                    body={item.description}
                    levelNumber={item.level_number}
                    categories={item.categories}
                    status={deriveStatus(item)}
                    deadline={item.deadline_at}
                    championName={item.assigned_by?.name ?? null}
                    message={null}
                    submittedAt={tab === "HISTORY" ? item.submitted_at : null}
                    href={`/${projectId}/student/skill-practice/use-cases/${item.id}`}
                  />
                ))}
              </div>
            </>
          )}
        </SectionContainerAILN>
      </div>
    </PageContainerAILN>
  );
}
