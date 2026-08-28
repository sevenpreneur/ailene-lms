import { selfAssignUseCase } from "@/apis/use-cases";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const useCaseId = body?.use_case_id;

  if (typeof useCaseId !== "number") {
    return NextResponse.json(
      { message: "use_case_id is required" },
      { status: 400 }
    );
  }

  const result = await selfAssignUseCase(useCaseId);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
