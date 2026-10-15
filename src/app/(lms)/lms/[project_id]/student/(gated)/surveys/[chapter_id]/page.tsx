import { redirect } from "next/navigation";

export default async function ChapterSurveyPage({
  params,
}: {
  params: Promise<{ project_id: string; chapter_id: string }>;
}) {
  const { project_id, chapter_id } = await params;
  redirect(`/${project_id}/student/learning-path/${chapter_id}?survey=1`);
}
