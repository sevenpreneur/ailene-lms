import { submitChapterTest, type ChapterTestAnswers } from "@/apis/chapter-tests";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const testId = body?.test_id;
  const answers = body?.answers as ChapterTestAnswers | undefined;

  if (
    !Number.isInteger(testId) ||
    typeof answers !== "object" ||
    answers === null
  ) {
    return NextResponse.json(
      { message: "test_id and answers are required" },
      { status: 400 }
    );
  }

  const result = await submitChapterTest(testId, answers);
  if (!result.success) {
    // Keep the backend's status: 409 (already submitted) and 403 (locked) read differently to a 502.
    return NextResponse.json(
      { message: result.message },
      { status: result.code }
    );
  }

  return NextResponse.json(result.data);
}
