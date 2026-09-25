import { deleteAssignmentDraft } from "@/apis/champion";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  const draftId = body?.draft_id;

  if (typeof projectId !== "string" || typeof draftId !== "number") {
    return NextResponse.json(
      { message: "project_id and draft_id are required" },
      { status: 400 }
    );
  }

  const result = await deleteAssignmentDraft(projectId, draftId);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
