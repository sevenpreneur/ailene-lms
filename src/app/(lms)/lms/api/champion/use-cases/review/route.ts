import { reviewUseCase } from "@/apis/champion";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  const submissionId = body?.submission_id;
  const isAccepted = body?.is_accepted;

  if (
    typeof projectId !== "string" ||
    typeof submissionId !== "number" ||
    typeof isAccepted !== "boolean"
  ) {
    return NextResponse.json(
      { message: "project_id, submission_id, and is_accepted are required" },
      { status: 400 }
    );
  }

  const result = await reviewUseCase(projectId, {
    submission_id: submissionId,
    is_accepted: isAccepted,
    comment: body?.comment ?? null,
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
