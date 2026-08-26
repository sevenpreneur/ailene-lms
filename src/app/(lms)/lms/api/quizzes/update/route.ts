import { updateQuizAnswers, type QuizAnswers } from "@/apis/learnings";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const quizId = body?.quiz_id;
  const answers = body?.answers as QuizAnswers | undefined;

  if (typeof quizId !== "string" || typeof answers !== "object" || answers === null) {
    return NextResponse.json(
      { message: "quiz_id and answers are required" },
      { status: 400 }
    );
  }

  const result = await updateQuizAnswers(quizId, answers);
  if (!result) {
    return NextResponse.json(
      { message: "Failed to save quiz draft" },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
