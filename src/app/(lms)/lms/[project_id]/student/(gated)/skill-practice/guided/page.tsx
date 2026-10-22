import { captureApiRead } from "@/apis/api";
import {
  getAssignedUseCases,
  getGuidedSession,
  getUseCaseDetails,
} from "@/apis/use-cases";
import GuidedUseCaseAILN from "@/components/forms/GuidedUseCaseAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppPageState from "@/components/states/AppPageState";
import LoadErrorAILN from "@/components/states/LoadErrorAILN";
import dayjs from "dayjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Catat Use Case" };

export default async function GuidedUseCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string }>;
  searchParams: Promise<{ use_case_id?: string; session_id?: string }>;
}) {
  const { project_id } = await params;
  const { use_case_id, session_id } = await searchParams;
  const useCaseId = use_case_id ? Number(use_case_id) : null;
  const sessionId = session_id ? Number(session_id) : null;

  if (
    (use_case_id &&
      (!Number.isSafeInteger(useCaseId) || !useCaseId || useCaseId <= 0)) ||
    (session_id &&
      (!Number.isSafeInteger(sessionId) || !sessionId || sessionId <= 0))
  ) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const guided = await getGuidedSession({
    project_id,
    ...(sessionId ? { session_id: sessionId } : {}),
    ...(useCaseId ? { use_case_id: useCaseId } : {}),
  });
  if (!guided.success) {
    return (
      <PageContainerAILN>
        <LoadErrorAILN message="Use Case terpandu belum dapat dimuat." />
      </PageContainerAILN>
    );
  }
  if (
    ((sessionId || useCaseId) && !guided.data) ||
    (guided.data && guided.data.project_id !== project_id) ||
    (useCaseId && guided.data?.use_case_id !== useCaseId)
  ) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const assignmentId = useCaseId ?? guided.data?.use_case_id;
  if (assignmentId) {
    const [detail, assigned] = await Promise.all([
      getUseCaseDetails(assignmentId),
      captureApiRead(getAssignedUseCases(project_id)),
    ]);
    if (detail.kind === "not_found")
      return <AppPageState variant="NOT_FOUND" />;
    const assignment = assigned.data?.find((item) => item.id === assignmentId);
    const needsRevision =
      !!detail.data.submitted_at &&
      !!detail.data.reviewed_at &&
      !detail.data.is_accepted &&
      dayjs(detail.data.reviewed_at).isAfter(dayjs(detail.data.submitted_at));
    return (
      <PageContainerAILN>
        <GuidedUseCaseAILN
          key={guided.data?.id}
          projectId={project_id}
          useCaseId={assignmentId}
          useCaseName={detail.data.name}
          championName={assignment?.assigned_by?.name ?? null}
          initialSession={guided.data}
          submissionStatus={
            detail.data.is_accepted
              ? "accepted"
              : needsRevision
                ? "needs_revision"
                : "awaiting_review"
          }
          allowResubmit={needsRevision}
        />
      </PageContainerAILN>
    );
  }

  return (
    <PageContainerAILN>
      <GuidedUseCaseAILN
        key={guided.data?.id ?? "new"}
        projectId={project_id}
        initialSession={guided.data}
      />
    </PageContainerAILN>
  );
}
