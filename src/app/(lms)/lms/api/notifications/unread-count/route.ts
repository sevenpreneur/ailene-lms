import { getUnreadNotificationCount } from "@/apis/notifications";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  if (typeof projectId !== "string" || !projectId.trim()) {
    return NextResponse.json(
      { message: "project_id is required" },
      { status: 400 },
    );
  }

  const unreadCount = await getUnreadNotificationCount(projectId);
  if (unreadCount === null) {
    return NextResponse.json(
      { message: "Gagal memuat jumlah notifikasi" },
      { status: 502 },
    );
  }
  return NextResponse.json({ unread_count: unreadCount });
}
