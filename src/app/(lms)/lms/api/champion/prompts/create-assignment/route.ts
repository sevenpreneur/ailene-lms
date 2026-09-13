import { createPromptAssignment } from "@/apis/champion";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = body?.project_id;
  const name = body?.name;
  const description = body?.description;
  const expectedOutput = body?.expected_output;
  const categoryIds = body?.category_ids;

  if (
    typeof projectId !== "string" ||
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof expectedOutput !== "string" ||
    !Array.isArray(categoryIds)
  ) {
    return NextResponse.json(
      {
        message:
          "project_id, name, description, expected_output, and category_ids are required",
      },
      { status: 400 }
    );
  }

  const result = await createPromptAssignment(projectId, {
    name,
    description,
    expected_output: expectedOutput,
    category_ids: categoryIds,
    assignment: body?.assignment ?? null,
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
