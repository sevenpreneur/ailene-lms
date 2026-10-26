import { getChapterSurveyDetails } from "@/apis/chapter-surveys";
import { getChapterTests } from "@/apis/chapter-tests";
import { getChapterDetails } from "@/apis/chapters";
import { getChapterMaterials, getChapterVideos } from "@/apis/learnings";
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
  const { survey: surveyParam } = await searchParams;
  const chapterId = Number(chapterIdParam);

  if (!Number.isInteger(chapterId) || chapterId <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const chapter = await getChapterDetails(projectId, chapterId);
  if (!chapter) {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const unlocked = !chapter.locked;
  const [tests, videos, materials, surveyResult] = unlocked
    ? await Promise.all([
        getChapterTests(chapterId),
        getChapterVideos(chapterId),
        getChapterMaterials(chapterId),
        getChapterSurveyDetails(chapterId),
      ])
    : [[], [], [], null];
  const survey = surveyResult?.kind === "ok" ? surveyResult.data : null;

  return (
    <ChapterDetailsAILN
      chapter={chapter}
      tests={tests}
      videos={videos}
      materials={materials}
      survey={survey}
      unlocked={unlocked}
      projectId={projectId}
      initialSurveyOpen={surveyParam === "1" && unlocked && !!survey}
    />
  );
}
