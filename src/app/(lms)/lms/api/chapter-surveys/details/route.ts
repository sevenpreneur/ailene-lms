import { getChapterSurveyDetails } from "@/apis/chapter-surveys";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const chapterId = body?.chapter_id;
  if (!Number.isInteger(chapterId) || chapterId <= 0) {
    return NextResponse.json(
      { message: "Invalid chapter_id" },
      { status: 400 },
    );
  }

  const result = await getChapterSurveyDetails(chapterId);
  if (result.kind === "forbidden") {
    return NextResponse.json(
      { message: "Survei chapter ini belum tersedia." },
      { status: 403 },
    );
  }
  if (result.kind === "not_found") {
    return NextResponse.json(
      { message: "Survei tidak ditemukan." },
      { status: 404 },
    );
  }
  return NextResponse.json(result.data);
}
