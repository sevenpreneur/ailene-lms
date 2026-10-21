import { getGuidedSession } from "@/apis/use-cases";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { message: "session_id, project_id, or use_case_id is required" },
      { status: 400 }
    );
  }

  const result = await getGuidedSession(body);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
