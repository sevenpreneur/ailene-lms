import { captureApiRead } from "@/apis/api";
import { getUseCaseSubmissions } from "@/apis/champion";
import {
  getChapterTaskSubmissions,
  type ChapterTaskSubmissionStatus,
} from "@/apis/chapter-tasks";
import { getChapters } from "@/apis/chapters";
import SubmissionsChampionAILN from "@/components/pages/SubmissionsChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submissions",
};

const TASK_STATUSES: ChapterTaskSubmissionStatus[] = [
  "on_review",
  "approved",
  "rejected",
];

function positiveInt(raw: string | undefined): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export default async function ChampionSubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string }>;
  searchParams: Promise<{
    tab?: string;
    task_status?: string;
    task_chapter?: string;
    task_page?: string;
  }>;
}) {
  const { project_id } = await params;
  const query = await searchParams;
  const taskSearch = {
    status:
      TASK_STATUSES.find((status) => status === query.task_status) ??
      "on_review",
    chapterId: positiveInt(query.task_chapter),
    page: positiveInt(query.task_page) ?? 1,
  };

  const [useCaseSubmissions, taskQueue, chapters] = await Promise.all([
    getUseCaseSubmissions(project_id),
    captureApiRead(
      getChapterTaskSubmissions(project_id, {
        status: taskSearch.status,
        chapter_id: taskSearch.chapterId ?? undefined,
        page: taskSearch.page,
      }),
    ),
    captureApiRead(getChapters(project_id)),
  ]);

  return (
    <SubmissionsChampionAILN
      useCaseSubmissions={useCaseSubmissions}
      kind={query.tab === "tasks" ? "tasks" : "use_cases"}
      chapterTasks={{
        queue: taskQueue.data,
        failed: taskQueue.failed,
        chapters: (chapters.data ?? []).map(({ id, name }) => ({ id, name })),
        search: taskSearch,
      }}
    />
  );
}
