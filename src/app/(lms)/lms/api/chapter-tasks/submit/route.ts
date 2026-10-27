import { submitChapterTask } from "@/apis/chapter-tasks";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const taskId = body?.task_id;
  const proofUrl = body?.proof_url;
  const note = body?.note ?? null;

  if (
    !Number.isInteger(taskId) ||
    typeof proofUrl !== "string" ||
    (note !== null && typeof note !== "string")
  ) {
    return NextResponse.json(
      { message: "task_id and proof_url are required" },
      { status: 400 },
    );
  }

  const result = await submitChapterTask({
    task_id: taskId,
    proof_url: proofUrl,
    note,
  });
  if (!result.success) {
    // Keep the backend's status: 409 (already on review/approved) and 403 (locked) read differently to a 502.
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 },
    );
  }

  return NextResponse.json(result.data);
}
