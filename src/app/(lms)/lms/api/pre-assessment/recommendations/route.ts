import { getPreAssessmentRecommendations } from "@/apis/pre-assessment";
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

  const result = await getPreAssessmentRecommendations(projectId);
  if (!result) {
    return NextResponse.json(
      { message: "Failed to load recommendations" },
      { status: 502 },
    );
  }

  return NextResponse.json(result);
}
