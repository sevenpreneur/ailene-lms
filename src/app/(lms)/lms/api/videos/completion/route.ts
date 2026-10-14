import { completeVideo } from "@/apis/learnings";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const videoId = body?.video_id;

  if (!Number.isInteger(videoId) || videoId <= 0) {
    return NextResponse.json({ message: "video_id is required" }, { status: 400 });
  }

  const completion = await completeVideo(videoId);
  if (!completion) {
    return NextResponse.json(
      { message: "Gagal menyelesaikan video" },
      { status: 502 }
    );
  }

  return NextResponse.json(completion);
}
