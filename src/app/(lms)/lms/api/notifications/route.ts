import { getNotifications } from "@/apis/notifications";
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

  const page = Number.isInteger(body?.page) ? body.page : undefined;
  const notifications = await getNotifications(projectId, {
    unreadOnly: body?.unread_only === true,
    page,
  });
  if (!notifications) {
    return NextResponse.json(
      { message: "Gagal memuat notifikasi" },
      { status: 502 },
    );
  }
  return NextResponse.json(notifications);
}
