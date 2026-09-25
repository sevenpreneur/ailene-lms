import { generateAssignmentDrafts } from "@/apis/champion";
import { NextResponse } from "next/server";

// Backend waits up to 90s on DeepSeek; leave headroom so the platform does not cut it first.
export const maxDuration = 100;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  const instruction = body?.instruction;

  if (
    typeof projectId !== "string" ||
    typeof instruction !== "string" ||
    !instruction.trim()
  ) {
    return NextResponse.json(
      { message: "project_id and instruction are required" },
      { status: 400 },
    );
  }

  const result = await generateAssignmentDrafts(projectId, {
    instruction: instruction.trim(),
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 },
    );
  }

  return NextResponse.json(result.data);
}
