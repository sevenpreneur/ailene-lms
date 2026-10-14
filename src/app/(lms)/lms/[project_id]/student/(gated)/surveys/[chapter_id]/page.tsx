import { getChapterSurveyDetails } from "@/apis/chapter-surveys";
import ChapterSurveyAILN from "@/components/pages/ChapterSurveyAILN";
import AppPageState from "@/components/states/AppPageState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Survei Chapter",
};

export default async function ChapterSurveyPage({
  params,
}: {
  params: Promise<{ project_id: string; chapter_id: string }>;
}) {
  const { chapter_id } = await params;
  const chapterId = Number(chapter_id);

  if (!Number.isInteger(chapterId) || chapterId <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const result = await getChapterSurveyDetails(chapterId);
  if (result.kind === "forbidden") {
    return (
      <AppPageState
        variant="FORBIDDEN"
        message={
          result.reason === "chapter_locked"
            ? "Chapter ini belum terbuka. Periksa jadwal sesi atau hubungi admin."
            : "Kamu belum memiliki akses ke chapter ini."
        }
      />
    );
  }
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const survey = result.data;

  if (!survey.available && !survey.response) {
    return (
      <AppPageState
        variant="FORBIDDEN"
        message="Survei chapter ini baru dibuka setelah sesinya dimulai."
      />
    );
  }

  return <ChapterSurveyAILN survey={survey} />;
}
