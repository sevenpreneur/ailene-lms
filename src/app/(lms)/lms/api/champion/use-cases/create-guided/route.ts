import { createGuidedUseCase } from "@/apis/champion";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  const name = body?.name;
  const categoryIds = body?.category_ids;

  if (
    typeof projectId !== "string" ||
    typeof name !== "string" ||
    !Array.isArray(categoryIds) ||
    typeof body?.assignment !== "object" ||
    typeof body?.intake !== "object"
  ) {
    return NextResponse.json(
      {
        message:
          "project_id, name, category_ids, assignment, and intake are required",
      },
      { status: 400 }
    );
  }

  const result = await createGuidedUseCase(projectId, {
    name,
    description: typeof body.description === "string" ? body.description : null,
    category_ids: categoryIds,
    assignment: body.assignment,
    intake: body.intake,
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
