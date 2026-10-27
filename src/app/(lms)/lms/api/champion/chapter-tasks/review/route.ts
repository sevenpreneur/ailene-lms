import { reviewChapterTaskSubmission } from "@/apis/chapter-tasks";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const submissionId = body?.submission_id;
  const decision = body?.decision;
  const comment = body?.comment ?? null;

  if (
    !Number.isInteger(submissionId) ||
    (decision !== "approve" && decision !== "reject") ||
    (comment !== null && typeof comment !== "string")
  ) {
    return NextResponse.json(
      { message: "submission_id and decision are required" },
      { status: 400 },
    );
  }

  const result = await reviewChapterTaskSubmission({
    submission_id: submissionId,
    decision,
    comment,
  });
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 },
    );
  }

  return NextResponse.json(result.data);
}
