import { selfAssignPrompt } from "@/apis/prompts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const promptId = body?.prompt_id;

  if (typeof promptId !== "number") {
    return NextResponse.json(
      { message: "prompt_id is required" },
      { status: 400 }
    );
  }

  const result = await selfAssignPrompt(promptId);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
