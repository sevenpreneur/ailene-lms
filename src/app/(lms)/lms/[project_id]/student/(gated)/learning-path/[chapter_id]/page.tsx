import { getLearnings, getStudentChapters } from "@/apis/learnings";
import { getStudentStatus } from "@/apis/student";
import ChapterDetailsAILN from "@/components/pages/ChapterDetailsAILN";
import AppPageState from "@/components/states/AppPageState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Chapter",
};

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ project_id: string; chapter_id: string }>;
}) {
  const { project_id: projectId, chapter_id: chapterIdParam } = await params;
  const chapterId = Number(chapterIdParam);

  if (!Number.isInteger(chapterId) || chapterId <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const [chapters, status] = await Promise.all([
    getStudentChapters(projectId),
    getStudentStatus(projectId),
  ]);
  const chapterIndex = chapters.findIndex((item) => item.id === chapterId);
  if (chapterIndex === -1) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const chapter = chapters[chapterIndex];
  const unlocked = chapter.level.level_number <= (status?.current_level_number ?? 0);
  const learnings = unlocked ? await getLearnings(chapterId) : null;

  return (
    <ChapterDetailsAILN
      chapter={chapter}
      learnings={learnings}
      unlocked={unlocked}
      projectId={projectId}
      nextChapter={chapters[chapterIndex + 1] ?? null}
    />
  );
}
