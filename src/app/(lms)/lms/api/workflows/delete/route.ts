import { deleteWorkflow } from "@/apis/workflows";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    typeof body?.project_id !== "string" ||
    typeof body?.workflow_id !== "number"
  ) {
    return NextResponse.json(
      { message: "project_id and workflow_id are required" },
      { status: 400 },
    );
  }
  const result = await deleteWorkflow(body.project_id, body.workflow_id);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 },
    );
  }
  return NextResponse.json(result.data);
}
