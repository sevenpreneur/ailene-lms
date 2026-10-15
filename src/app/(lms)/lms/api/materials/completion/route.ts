import { completeMaterial } from "@/apis/learnings";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const materialId = body?.material_id;

  if (typeof materialId !== "string" || !materialId.trim()) {
    return NextResponse.json(
      { message: "material_id is required" },
      { status: 400 },
    );
  }

  const completion = await completeMaterial(materialId);
  if (!completion) {
    return NextResponse.json(
      { message: "Gagal menyelesaikan materi" },
      { status: 502 },
    );
  }

  return NextResponse.json(completion);
}
