import { generateGuidedWorkflow } from "@/apis/use-cases";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.session_id !== "number") {
    return NextResponse.json(
      { message: "session_id is required" },
      { status: 400 }
    );
  }

  const result = await generateGuidedWorkflow(body);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
