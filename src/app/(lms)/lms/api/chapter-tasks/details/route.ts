import { getChapterTaskDetails } from "@/apis/chapter-tasks";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const taskId = body?.task_id;

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return NextResponse.json(
      { message: "task_id is required" },
      { status: 400 },
    );
  }

  const result = await getChapterTaskDetails(taskId);
  if (result.kind === "forbidden") {
    return NextResponse.json(
      { message: "Kamu belum dapat membuka tugas ini." },
      { status: 403 },
    );
  }
  if (result.kind === "not_found") {
    return NextResponse.json(
      { message: "Tugas tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json(result.data);
}
