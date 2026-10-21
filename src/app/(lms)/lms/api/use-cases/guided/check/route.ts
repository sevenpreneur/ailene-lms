import { checkGuidedStep } from "@/apis/use-cases";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    typeof body?.session_id !== "number" ||
    typeof body?.step_id !== "number" ||
    typeof body?.is_done !== "boolean"
  ) {
    return NextResponse.json(
      { message: "session_id, step_id, and is_done are required" },
      { status: 400 }
    );
  }

  const result = await checkGuidedStep(body);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
