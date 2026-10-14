import { getStudentChapters, getStudentLevels } from "@/apis/learnings";
import LearningPathStudentAILN from "@/components/pages/LearningPathStudentAILN";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Student",
};

export default async function LearningPathPage({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string }>;
  searchParams: Promise<{ chapter?: string; practice?: string }>;
}) {
  const { project_id } = await params;
  const [query, levels, chapters] = await Promise.all([
    searchParams,
    getStudentLevels(project_id),
    getStudentChapters(project_id),
  ]);

  const chapterId = Number(query.chapter);
  if (
    query.chapter &&
    Number.isInteger(chapterId) &&
    chapters.some((chapter) => chapter.id === chapterId)
  ) {
    redirect(`/${project_id}/student/learning-path/${chapterId}`);
  }
  if (query.practice) {
    redirect(`/${project_id}/student/skill-practice`);
  }
  return (
    <LearningPathStudentAILN
      levels={levels}
      chapters={chapters}
      projectId={project_id}
    />
  );
}
