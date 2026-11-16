import { createWorkflow } from "@/apis/workflows";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.project_id !== "string" || !Array.isArray(body?.nodes)) {
    return NextResponse.json(
      { message: "project_id and nodes are required" },
      { status: 400 },
    );
  }
  const result = await createWorkflow(body.project_id, {
    title: typeof body.title === "string" ? body.title : "",
    problem: typeof body.problem === "string" ? body.problem : "",
    nodes: body.nodes,
  });
  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code || 502 },
    );
  }
  return NextResponse.json(result.data, { status: 201 });
}
