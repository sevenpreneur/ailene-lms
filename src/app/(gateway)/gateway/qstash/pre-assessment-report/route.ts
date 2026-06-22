import GetPrismaClient from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { generatePreAssessmentRecommendations } from "./utils";

type GeneratePreAssessmentReportPayload = {
  pre_assessment_id?: number;
};

export const POST = verifySignatureAppRouter(async (req: Request) => {
  const body = (await req.json()) as GeneratePreAssessmentReportPayload;
  const preAssessmentId = body.pre_assessment_id;

  if (typeof preAssessmentId !== "number") {
    return Response.json(
      { received: true, error: "Missing pre_assessment_id" },
      { status: 200 }
    );
  }

  const prisma = GetPrismaClient();

  try {
    // Mark processing so the polling UI flips from "pending" → "processing".
    await prisma.ailPreAssessmentReport.update({
      where: { pre_assessment_id: preAssessmentId },
      data: { status: "processing", error_message: null },
    });

    const [preAssessment, chapters] = await Promise.all([
      prisma.ailPreAssessment.findUnique({
        where: { id: preAssessmentId },
      }),
      prisma.ailChapter.findMany({
        select: { name: true },
        orderBy: { id: "asc" },
      }),
    ]);

    if (!preAssessment) {
      // The report row may not exist either; guard the update.
      await prisma.ailPreAssessmentReport
        .update({
          where: { pre_assessment_id: preAssessmentId },
          data: { status: "failed", error_message: "Pre-assessment not found" },
        })
        .catch(() => {});
      return Response.json({ received: true, error: "pre_assessment_not_found" });
    }

    const recommendations = await generatePreAssessmentRecommendations(
      {
        ai_use_frequency: preAssessment.ai_use_frequency,
        ai_tools_used: preAssessment.ai_tools_used,
        ai_limitations: preAssessment.ai_limitations,
        output_review: preAssessment.output_review,
        use_cases: preAssessment.use_cases,
        team_adoption: preAssessment.team_adoption,
        concrete_example: preAssessment.concrete_example,
        model_selection: preAssessment.model_selection,
        multimodal_use: preAssessment.multimodal_use,
        workflow_reuse: preAssessment.workflow_reuse,
        prompt_comfort: preAssessment.prompt_comfort,
        prompt_iteration: preAssessment.prompt_iteration,
        refine_scenario: preAssessment.refine_scenario,
        professional_attitude: preAssessment.professional_attitude,
        data_safety_check: preAssessment.data_safety_check,
        publish_unchecked: preAssessment.publish_unchecked,
        biggest_challenge: preAssessment.biggest_challenge,
        training_expectation: preAssessment.training_expectation,
      },
      chapters.map((c) => c.name)
    );

    await prisma.ailPreAssessmentReport.update({
      where: { pre_assessment_id: preAssessmentId },
      data: {
        status: "completed",
        recommendations: recommendations as unknown as Prisma.InputJsonValue,
        error_message: null,
        generated_at: new Date(),
      },
    });

    return Response.json({ received: true, status: "completed" });
  } catch (err) {
    console.error("qstash.pre-assessment-report:", err);
    await prisma.ailPreAssessmentReport
      .update({
        where: { pre_assessment_id: preAssessmentId },
        data: {
          status: "failed",
          error_message:
            err instanceof Error ? err.message.slice(0, 500) : "generation_failed",
        },
      })
      .catch(() => {});
    return Response.json({ received: true, error: "generation_failed" });
  }
});
