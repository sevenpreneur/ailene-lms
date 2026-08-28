import { submitPrompt } from "@/apis/prompts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const promptId = body?.prompt_id;
  const input = body?.input;
  const output = body?.output;

  if (
    typeof promptId !== "number" ||
    typeof input !== "string" ||
    typeof output !== "string"
  ) {
    return NextResponse.json(
      { message: "prompt_id, input, and output are required" },
      { status: 400 }
    );
  }

  const result = await submitPrompt({ prompt_id: promptId, input, output });
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
