import { getLearnings } from "@/apis/learnings";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterId = Number(searchParams.get("chapter_id"));

  if (!Number.isInteger(chapterId) || chapterId <= 0) {
    return NextResponse.json(
      { message: "chapter_id is required" },
      { status: 400 }
    );
  }

  const learnings = await getLearnings(chapterId);
  if (!learnings) {
    return NextResponse.json(
      { message: "Failed to load chapter learnings" },
      { status: 502 }
    );
  }

  return NextResponse.json(learnings);
}
