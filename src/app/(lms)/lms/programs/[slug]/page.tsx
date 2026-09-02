import { checkSession } from "@/apis/auth";
import ProgramPreviewAILN from "@/components/pages/ProgramPreviewAILN";
import { LOGIN_URL } from "@/lib/config";
import { getProgramPreviewBySlugMock } from "@/mock-data/explore";
import { notFound, redirect } from "next/navigation";

export default async function ProgramPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await checkSession();

  if (!session) redirect(LOGIN_URL);

  const program = getProgramPreviewBySlugMock(slug);
  if (!program) notFound();

  return <ProgramPreviewAILN session={session} program={program} />;
}
