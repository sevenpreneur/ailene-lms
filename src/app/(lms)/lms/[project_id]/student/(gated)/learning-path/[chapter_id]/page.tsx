import {
  getLearnings,
  getMaterialDetails,
  getStudentChapters,
  type MaterialDetail,
} from "@/apis/learnings";
import ChapterDetailsAILN from "@/components/pages/ChapterDetailsAILN";
import AppPageState from "@/components/states/AppPageState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Chapter",
};

export default async function ChapterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string; chapter_id: string }>;
  searchParams: Promise<{ survey?: string }>;
}) {
  const { project_id: projectId, chapter_id: chapterIdParam } = await params;
  const { survey } = await searchParams;
  const chapterId = Number(chapterIdParam);

  if (!Number.isInteger(chapterId) || chapterId <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const chapters = await getStudentChapters(projectId);
  const chapterIndex = chapters.findIndex((item) => item.id === chapterId);
  if (chapterIndex === -1) {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const chapter = chapters[chapterIndex];
  const unlocked = !chapter.locked;
  const learnings = unlocked ? await getLearnings(chapterId) : null;
  const materialResults = await Promise.all(
    (learnings?.materials ?? []).map((material) =>
      getMaterialDetails(material.id),
    ),
  );
  const materialDetails: Record<string, MaterialDetail> = Object.fromEntries(
    materialResults.flatMap((result) =>
      result.kind === "ok" ? [[result.data.id, result.data]] : [],
    ),
  );

  return (
    <ChapterDetailsAILN
      chapter={chapter}
      learnings={learnings}
      materialDetails={materialDetails}
      unlocked={unlocked}
      projectId={projectId}
      nextChapter={chapters[chapterIndex + 1] ?? null}
      initialSurveyOpen={survey === "1" && unlocked && !!learnings?.survey}
    />
  );
}
