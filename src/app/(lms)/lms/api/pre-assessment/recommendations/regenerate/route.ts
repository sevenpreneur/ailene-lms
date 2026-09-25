import { regeneratePreAssessmentRecommendations } from "@/apis/pre-assessment";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;

  if (typeof projectId !== "string") {
    return NextResponse.json(
      { message: "project_id is required" },
      { status: 400 },
    );
  }

  const result = await regeneratePreAssessmentRecommendations(projectId);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 },
    );
  }

  return NextResponse.json(result.data);
}
