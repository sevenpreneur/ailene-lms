import { captureApiRead } from "@/apis/api";
import { getAssignedUseCases, getUseCases } from "@/apis/use-cases";
import SkillPracticeStudentAILN from "@/components/pages/SkillPracticeStudentAILN";
import { Metadata } from "next";
export const metadata: Metadata = { title: "Latihan AI" };
export default async function StudentPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { project_id } = await params;
  const query = await searchParams;
  const parsedPage = Number(query.page);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const [library, assignedUseCases] = await Promise.all([
    captureApiRead(
      getUseCases(project_id, {
        page,
        search: query.search?.slice(0, 255),
        page_size: 20,
      }),
    ),
    captureApiRead(getAssignedUseCases(project_id)),
  ]);
  return (
    <SkillPracticeStudentAILN
      useCaseLibrary={library.data?.list ?? []}
      libraryPaging={library.data?.metapaging ?? null}
      assignedUseCases={assignedUseCases.data ?? []}
      libraryFailed={library.failed}
      assignedFailed={assignedUseCases.failed}
    />
  );
}
