import { submitChapterSurvey } from "@/apis/chapter-surveys";
import { NextResponse } from "next/server";

function isRating(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const chapterId = body?.chapter_id;
  const comment = body?.comment;

  if (
    !Number.isInteger(chapterId) ||
    !isRating(body?.satisfaction) ||
    !isRating(body?.relevance) ||
    !isRating(body?.trainer_rating) ||
    (comment !== null && comment !== undefined && typeof comment !== "string")
  ) {
    return NextResponse.json(
      { message: "chapter_id and three 1-5 ratings are required" },
      { status: 400 }
    );
  }

  const result = await submitChapterSurvey(chapterId, {
    satisfaction: body.satisfaction,
    relevance: body.relevance,
    trainer_rating: body.trainer_rating,
    comment: comment ?? null,
  });
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code }
    );
  }

  return NextResponse.json(result.data);
}
