"use client";
import LoadErrorAILN from "@/components/states/LoadErrorAILN";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import type { Metapaging } from "@/apis/use-cases";
import RecordUseCaseButtonAILN from "@/components/buttons/RecordUseCaseButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import SkillPracticeCardAILN, {
  type Category,
  type PracticeStatus,
} from "@/components/items/SkillPracticeCardAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import Tabs from "@/components/navigations/Tabs";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { AssignedUseCase, UseCaseLibraryItem } from "@/apis/use-cases";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { BookOpen, Clock, History, Library } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

dayjs.locale("id");

type PracticeTab = "ASSIGNED" | "LIBRARY" | "HISTORY";

interface PracticeItem {
  id: number;
  href: string;
  title: string;
  body: string;
  level_number: number;
  categories: Category[];
  champion_name: string | null;
  deadline: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean;
}

interface LibraryItem {
  id: number;
  href: string;
  title: string;
  body: string;
  level_number: number;
  categories: Category[];
  submission: {
    deadline: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    is_accepted: boolean;
  } | null;
}

async function selfAssign(id: number): Promise<boolean> {
  try {
    const res = await fetch("/api/use-cases/self-assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ use_case_id: id }),
    });
    if (
      !res.ok ||
      res.redirected ||
      !res.headers.get("content-type")?.includes("application/json")
    ) {
      const data = await res.json().catch(() => null);
      toast.error(data?.message ?? "Gagal self-assign latihan.");
      return false;
    }
    return true;
  } catch {
    toast.error("Gagal self-assign latihan.");
    return false;
  }
}

function practiceHref(projectId: string, refId: number) {
  return `/${projectId}/student/skill-practice/use-cases/${refId}`;
}

function tabFromParam(value: string | null): PracticeTab {
  if (value === "library") return "LIBRARY";
  if (value === "history") return "HISTORY";
  return "ASSIGNED";
}

function deriveStatus(item: {
  submitted_at: string | null;
  reviewed_at: string | null;
  is_accepted: boolean;
}): PracticeStatus {
  if (item.is_accepted) return "ACCEPTED";
  if (!item.submitted_at) return "PENDING_SUBMIT";
  if (
    item.reviewed_at &&
    dayjs(item.reviewed_at).isAfter(dayjs(item.submitted_at))
  ) {
    return "NEEDS_REVISION";
  }
  return "AWAITING_REVIEW";
}

function assignedToPracticeItem(
  row: AssignedUseCase,
  projectId: string,
): PracticeItem {
  return {
    id: row.id,
    href: practiceHref(projectId, row.id),
    title: row.name,
    body: row.description,
    level_number: row.level_number,
    categories: row.categories,
    champion_name: row.assigned_by?.name ?? null,
    deadline: row.deadline_at,
    submitted_at: row.submitted_at,
    reviewed_at: row.reviewed_at,
    is_accepted: row.is_accepted,
  };
}

function libraryToItem(
  row: UseCaseLibraryItem,
  projectId: string,
): LibraryItem {
  return {
    id: row.id,
    href: practiceHref(projectId, row.id),
    title: row.name,
    body: row.description,
    level_number: row.level_number,
    categories: row.categories,
    submission: row.submitted_at
      ? {
          deadline: row.deadline_at,
          submitted_at: row.submitted_at,
          reviewed_at: row.reviewed_at,
          is_accepted: row.is_accepted ?? false,
        }
      : null,
  };
}

export default function SkillPracticeStudentAILN({
  useCaseLibrary,
  assignedUseCases,
  libraryPaging,
  libraryFailed = false,
  assignedFailed = false,
}: {
  useCaseLibrary: UseCaseLibraryItem[];
  assignedUseCases: AssignedUseCase[];
  libraryPaging: Metapaging | null;
  libraryFailed?: boolean;
  assignedFailed?: boolean;
}) {
  const searchParams = useSearchParams();
  const projectId = useProjectId();

  const router = useRouter();
  const pathname = usePathname();
  const tab = tabFromParam(searchParams.get("tab"));
  function updateQuery(patch: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.push(`${pathname}?${next}`, { scroll: false });
  }

  const assignedItems: PracticeItem[] = [
    ...assignedUseCases.map((r) => assignedToPracticeItem(r, projectId)),
  ].sort((a, b) => {
    const statusOrder =
      Number(a.is_accepted) - Number(b.is_accepted) ||
      Number(Boolean(a.submitted_at)) - Number(Boolean(b.submitted_at));
    if (statusOrder !== 0) return statusOrder;
    return (
      dayjs(a.deadline ?? "9999-12-31").valueOf() -
      dayjs(b.deadline ?? "9999-12-31").valueOf()
    );
  });

  const libraryItems: LibraryItem[] = [
    ...useCaseLibrary.map((r) => libraryToItem(r, projectId)),
  ].sort((a, b) => {
    if (a.level_number !== b.level_number) {
      return a.level_number - b.level_number;
    }
    return a.title.localeCompare(b.title);
  });

  const historyItems = assignedItems.filter(
    (item) => item.submitted_at !== null,
  );

  const pendingAssignedCount = assignedItems.filter(
    (item) => deriveStatus(item) === "PENDING_SUBMIT",
  ).length;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Latihan AI"
          desc="Terapkan AI di pekerjaanmu lewat Use Case."
        >
          <RecordUseCaseButtonAILN projectId={projectId} />
        </PageHeaderAILN>

        <Tabs<PracticeTab>
          ariaLabel="Bagian latihan AI"
          value={tab}
          onValueChange={(value) =>
            updateQuery({
              tab:
                value === "LIBRARY"
                  ? "library"
                  : value === "HISTORY"
                    ? "history"
                    : "",
            })
          }
          items={[
            {
              value: "ASSIGNED",
              label: "Untukmu",
              icon: <Clock className="size-4" />,
              badge: pendingAssignedCount > 0 ? pendingAssignedCount : null,
            },
            {
              value: "LIBRARY",
              label: "Library",
              icon: <Library className="size-4" />,
            },
            {
              value: "HISTORY",
              label: "Riwayat",
              icon: <History className="size-4" />,
            },
          ]}
        />

        {tab === "ASSIGNED" && (
          <SectionContainerAILN
            title="Untukmu"
            contentClassName="flex flex-col gap-4"
          >
            {assignedFailed ? (
              <LoadErrorAILN message="Tugas dari Champion belum dapat dimuat. Kamu tetap bisa membuka Library." />
            ) : assignedItems.length === 0 ? (
              <EmptyState label="Belum ada use case untukmu." />
            ) : (
              <>
                {pendingAssignedCount > 0 && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    <strong>{pendingAssignedCount}</strong> use case belum
                    dikerjakan.
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {assignedItems.map((item) => (
                    <SkillPracticeCardAILN
                      key={item.id}
                      title={item.title}
                      body={item.body}
                      levelNumber={item.level_number}
                      categories={item.categories}
                      status={deriveStatus(item)}
                      deadline={item.deadline}
                      championName={item.champion_name}
                      message={null}
                      submittedAt={null}
                      href={item.href}
                    />
                  ))}
                </div>
              </>
            )}
          </SectionContainerAILN>
        )}

        {tab === "LIBRARY" && (
          <SectionContainerAILN
            title="Use Case Library"
            contentClassName="flex flex-col gap-4"
          >
            <form
              key={searchParams.get("search") ?? ""}
              className="flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                updateQuery({
                  search: String(data.get("search") ?? "").trim(),
                  page: "1",
                });
              }}
            >
              <label className="sr-only" htmlFor="use-case-search">
                Cari use case
              </label>
              <input
                id="use-case-search"
                name="search"
                defaultValue={searchParams.get("search") ?? ""}
                maxLength={255}
                placeholder="Cari use case..."
                className="min-w-0 flex-1 rounded-lg border border-dashboard-border bg-card-2 px-3 py-2 text-sm"
              />
              <ButtonAILN type="submit" variant="outline">
                Cari
              </ButtonAILN>
            </form>
            {libraryPaging && (
              <p role="status" className="text-sm text-muted-foreground">
                {libraryPaging.total_data} hasil · Halaman{" "}
                {libraryPaging.current_page} dari{" "}
                {Math.max(1, libraryPaging.total_page)}
              </p>
            )}
            {libraryFailed ? (
              <LoadErrorAILN message="Use Case Library belum dapat dimuat." />
            ) : libraryItems.length === 0 ? (
              <EmptyState
                label={
                  searchParams.get("search")
                    ? "Tidak ada use case yang cocok. Coba kata lain."
                    : "Belum ada use case di library."
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {libraryItems.map((item) => (
                  <SkillPracticeCardAILN
                    key={item.id}
                    title={item.title}
                    body={item.body}
                    levelNumber={item.level_number}
                    categories={item.categories}
                    status={deriveStatus(
                      item.submission ?? {
                        submitted_at: null,
                        reviewed_at: null,
                        is_accepted: false,
                      },
                    )}
                    deadline={item.submission?.deadline ?? null}
                    championName={null}
                    message={null}
                    submittedAt={item.submission?.submitted_at ?? null}
                    href={item.href}
                    onSelfAssign={() => selfAssign(item.id)}
                  />
                ))}
              </div>
            )}
            {libraryPaging && libraryPaging.total_page > 1 && (
              <nav
                aria-label="Halaman katalog"
                className="flex flex-wrap gap-2"
              >
                <ButtonAILN
                  variant="outline"
                  disabled={libraryPaging.current_page <= 1}
                  onClick={() =>
                    updateQuery({
                      page: String(libraryPaging.current_page - 1),
                    })
                  }
                >
                  Sebelumnya
                </ButtonAILN>
                <ButtonAILN
                  variant="outline"
                  disabled={
                    libraryPaging.current_page >= libraryPaging.total_page
                  }
                  onClick={() =>
                    updateQuery({
                      page: String(libraryPaging.current_page + 1),
                    })
                  }
                >
                  Berikutnya
                </ButtonAILN>
              </nav>
            )}
          </SectionContainerAILN>
        )}

        {tab === "HISTORY" && (
          <SectionContainerAILN
            title="Riwayat Tugas Champion"
            desc="Hasil latihan dari library dapat dibuka melalui pencarian Library. Riwayat catatan pribadi belum tersedia."
            contentClassName="flex flex-col gap-4"
          >
            {assignedFailed ? (
              <LoadErrorAILN message="Riwayat tugas Champion belum dapat dimuat." />
            ) : historyItems.length === 0 ? (
              <EmptyState label="Belum ada tugas Champion yang dikirim." />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {historyItems.map((item) => (
                  <SkillPracticeCardAILN
                    key={item.id}
                    title={item.title}
                    body={item.body}
                    levelNumber={item.level_number}
                    categories={item.categories}
                    status={deriveStatus(item)}
                    deadline={item.deadline}
                    championName={item.champion_name}
                    message={null}
                    submittedAt={item.submitted_at}
                    href={item.href}
                  />
                ))}
              </div>
            )}
          </SectionContainerAILN>
        )}
      </div>
    </PageContainerAILN>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border py-12 text-center text-gray-500 dark:text-gray-400">
      <BookOpen className="size-6" />
      <div className="text-sm">{label}</div>
    </div>
  );
}
