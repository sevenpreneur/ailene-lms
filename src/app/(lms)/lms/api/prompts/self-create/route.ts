import { selfCreatePrompt, type SelfCreatePromptInput } from "@/apis/prompts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const projectId = body?.project_id;
  const name = body?.name;
  const scenario = body?.scenario;
  const input = body?.input;
  const output = body?.output;
  const categoryIds = body?.category_ids;

  if (
    typeof projectId !== "string" ||
    typeof name !== "string" ||
    typeof scenario !== "string" ||
    typeof input !== "string" ||
    typeof output !== "string" ||
    !Array.isArray(categoryIds)
  ) {
    return NextResponse.json(
      {
        message:
          "project_id, name, scenario, input, output, and category_ids are required",
      },
      { status: 400 }
    );
  }

  const payload: SelfCreatePromptInput = {
    project_id: projectId,
    name,
    scenario,
    input,
    output,
    category_ids: categoryIds,
  };

  const result = await selfCreatePrompt(payload);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
