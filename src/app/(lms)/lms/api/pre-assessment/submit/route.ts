import {
  submitPreAssessment,
  type PreAssessmentAnswer,
} from "@/apis/pre-assessment";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  const answers = body?.answers as PreAssessmentAnswer[] | undefined;

  if (
    typeof projectId !== "string" ||
    !Array.isArray(answers)
  ) {
    return NextResponse.json(
      { message: "project_id and answers are required" },
      { status: 400 },
    );
  }

  const result = await submitPreAssessment(projectId, answers);
  if (!result.success) {
    // Pass the backend's message through: "already submitted" reads differently to a missing answer.
    return NextResponse.json(
      { message: result.message },
      { status: result.code },
    );
  }

  return NextResponse.json(result.data);
}
