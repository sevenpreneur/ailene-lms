import { assignUseCase, type AssignmentTarget } from "@/apis/champion";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  const libraryId = body?.library_id;

  if (typeof projectId !== "string" || typeof libraryId !== "number") {
    return NextResponse.json(
      { message: "project_id and library_id are required" },
      { status: 400 }
    );
  }

  const result = await assignUseCase(
    projectId,
    libraryId,
    body as AssignmentTarget
  );
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
