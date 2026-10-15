import { submitChapterSurvey } from "@/apis/chapter-surveys";
import {
  CHAPTER_SURVEY_RATING_KEYS,
  CHAPTER_SURVEY_TEXT_KEYS,
  CHAPTER_SURVEY_TEXT_MAX,
} from "@/lib/chapter-evaluation";
import { NextResponse } from "next/server";

function isRating(value: unknown): value is number {
  return (
    Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const chapterId = body?.chapter_id;

  if (
    !Number.isInteger(chapterId) ||
    chapterId <= 0 ||
    !CHAPTER_SURVEY_RATING_KEYS.every((key) => isRating(body?.[key])) ||
    !CHAPTER_SURVEY_TEXT_KEYS.every(
      (key) =>
        body?.[key] == null ||
        (typeof body[key] === "string" &&
          body[key].length <= CHAPTER_SURVEY_TEXT_MAX),
    )
  ) {
    return NextResponse.json(
      {
        message:
          "chapter_id, eight 1-5 ratings, and text answers up to 2000 characters are required",
      },
      { status: 400 },
    );
  }

  const result = await submitChapterSurvey(chapterId, {
    trainer_clarity: body.trainer_clarity,
    trainer_mastery: body.trainer_mastery,
    trainer_responsiveness: body.trainer_responsiveness,
    trainer_engagement: body.trainer_engagement,
    material_relevance: body.material_relevance,
    material_flow: body.material_flow,
    material_depth: body.material_depth,
    learning_value: body.learning_value,
    favorite_material: body.favorite_material ?? null,
    missing_topics: body.missing_topics ?? null,
    disliked_material: body.disliked_material ?? null,
    improvement_suggestion: body.improvement_suggestion ?? null,
  });
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code },
    );
  }

  return NextResponse.json(result.data);
}
