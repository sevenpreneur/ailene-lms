import { markNotificationsRead } from "@/apis/notifications";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  const ids = body?.notification_ids;
  if (typeof projectId !== "string" || !projectId.trim()) {
    return NextResponse.json(
      { message: "project_id is required" },
      { status: 400 },
    );
  }
  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    !ids.every((id) => Number.isInteger(id) && id > 0)
  ) {
    return NextResponse.json(
      { message: "notification_ids must be a non-empty list of ids" },
      { status: 400 },
    );
  }

  const result = await markNotificationsRead(projectId, ids);
  if (!result) {
    return NextResponse.json(
      { message: "Gagal menandai notifikasi" },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}
