import {
  selfCreateUseCase,
  type SelfCreateUseCaseInput,
} from "@/apis/use-cases";
import { NextResponse } from "next/server";

const FREQUENCIES = ["daily", "weekly", "monthly", "occasionally"] as const;
const TYPES = [
  "workflow_automation",
  "content_creation",
  "data_analysis",
  "research",
  "communication",
  "decision_support",
  "learning",
  "other",
] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const projectId = body?.project_id;
  const name = body?.name;
  const categoryIds = body?.category_ids;
  const outcomeProof = body?.outcome_proof;
  const hoursWithAi = body?.hours_with_ai;
  const hoursWithoutAi = body?.hours_without_ai;
  const description = body?.description;
  const aiTool = body?.ai_tool;
  const frequency = body?.frequency;
  const type = body?.type;

  if (
    typeof projectId !== "string" ||
    typeof name !== "string" ||
    !Array.isArray(categoryIds) ||
    typeof outcomeProof !== "string" ||
    typeof hoursWithAi !== "number" ||
    typeof hoursWithoutAi !== "number" ||
    typeof description !== "string" ||
    typeof aiTool !== "string" ||
    !FREQUENCIES.includes(frequency) ||
    !TYPES.includes(type)
  ) {
    return NextResponse.json(
      { message: "invalid or missing self-create use case fields" },
      { status: 400 }
    );
  }

  const payload: SelfCreateUseCaseInput = {
    project_id: projectId,
    name,
    category_ids: categoryIds,
    outcome_proof: outcomeProof,
    hours_with_ai: hoursWithAi,
    hours_without_ai: hoursWithoutAi,
    description,
    ai_tool: aiTool,
    frequency,
    type,
  };

  const result = await selfCreateUseCase(payload);
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 }
    );
  }

  return NextResponse.json(result.data);
}
