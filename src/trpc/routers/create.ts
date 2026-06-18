import {
  STATUS_BAD_REQUEST,
  STATUS_FORBIDDEN,
  STATUS_NOT_FOUND,
  STATUS_OK,
} from "@/lib/status_code";
import {
  ailMemberProcedure,
  championProcedure,
  createTRPCRouter,
} from "@/trpc/init";
import { schedulePreAssessmentReport } from "@/trpc/routers/ailene/utils.ailene";
import { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const assignInputSchema = z.object({
  library_id: z.number().int().positive(),
  target_type: z.enum(["MEMBER", "GROUP"]),
  target_ids: z.array(z.number().int().positive()).min(1),
  deadline: z.string().datetime(),
  message: z.string().max(500).nullable().optional(),
});

const createAssignmentBaseSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  category_ids: z
    .array(z.number().int().positive())
    .min(1, "Pilih minimal 1 kategori.")
    .max(2, "Maksimal 2 kategori."),
  assignment: z
    .object({
      target_type: z.enum(["MEMBER", "GROUP"]),
      target_ids: z.array(z.number().int().positive()).min(1),
      deadline: z.string().datetime(),
      message: z.string().max(500).nullable().optional(),
    })
    .nullable()
    .optional(),
});

const createPromptAssignmentSchema = createAssignmentBaseSchema.extend({
  expected_output: z.string().min(1),
});

const createUseCaseAssignmentSchema = createAssignmentBaseSchema;

async function resolveAssignmentTargets(
  prisma: PrismaClient,
  championId: number,
  targetType: "MEMBER" | "GROUP",
  targetIds: number[]
): Promise<number[]> {
  if (targetType === "GROUP") {
    const groups = await prisma.ailGroup.findMany({
      where: { id: { in: targetIds }, champion_id: championId },
      include: { members: { select: { id: true } } },
    });
    if (groups.length !== targetIds.length) {
      throw new TRPCError({
        code: STATUS_FORBIDDEN,
        message: "Some groups are not yours.",
      });
    }
    return Array.from(
      new Set(groups.flatMap((g) => g.members.map((m) => m.id)))
    );
  }
  const members = await prisma.ailMember.findMany({
    where: {
      id: { in: targetIds },
      group: { champion_id: championId },
    },
    select: { id: true },
  });
  if (members.length !== targetIds.length) {
    throw new TRPCError({
      code: STATUS_FORBIDDEN,
      message: "Some members are not in your team.",
    });
  }
  return members.map((m) => m.id);
}

// Placeholder for AilPrompt.expected_output on self-initiated practice — there
// is no champion-defined target output, the champion reviews the actual I/O.
const SELF_PRACTICE_PLACEHOLDER = "(Latihan mandiri — tanpa target output)";

// Resolve the champion that a self-initiated practice should be routed to.
// A student must belong to a group; the entry is assigned to that group's
// champion so it lands in the champion's review queue.
async function resolveMemberChampion(
  prisma: PrismaClient,
  memberGroupId: number | null
): Promise<number> {
  if (!memberGroupId) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message:
        "Kamu belum tergabung dalam grup, jadi belum bisa menambah latihan mandiri.",
    });
  }
  const group = await prisma.ailGroup.findUnique({
    where: { id: memberGroupId },
    select: { champion_id: true },
  });
  if (!group) {
    throw new TRPCError({
      code: STATUS_NOT_FOUND,
      message: "Group not found.",
    });
  }
  return group.champion_id;
}

const aiUseFrequencyEnum = z.enum([
  "NEVER",
  "TRIED",
  "WEEKLY",
  "DAILY",
  "INTENSIVE",
]);
const freqEnum = z.enum(["NEVER", "RARELY", "SOMETIMES", "OFTEN", "ALWAYS"]);
const refineScenarioEnum = z.enum([
  "TARGETED",
  "SWITCH_TOOL",
  "MANUAL",
  "RESTART",
]);
const outputReviewEnum = z.enum([
  "NO_CHECK",
  "SOMETIMES",
  "ALWAYS",
  "CROSS_CHECK",
  "NO_USE",
]);
const teamAdoptionEnum = z.enum([
  "NONE",
  "PERSONAL",
  "PILOT",
  "POLICY",
  "INTEGRATED",
]);
const promptSkillEnum = z.enum([
  "NONE",
  "BASIC",
  "DECENT",
  "STRUCTURED",
  "EXPERT",
]);
const attitudeEnum = z.enum([
  "TOO_RISKY",
  "CAUTIOUS",
  "NEUTRAL",
  "SUPPORTIVE",
  "ESSENTIAL",
]);
const motivationEnum = z.enum([
  "MANDATORY",
  "CURIOUS",
  "TENTATIVE",
  "READY",
  "EAGER",
]);

const preAssessmentInputSchema = z.object({
  ai_use_frequency: aiUseFrequencyEnum,
  ai_tools_used: z.array(z.string().min(1)).min(1),
  ai_limitations: z.array(z.string().min(1)).min(1),
  output_review: outputReviewEnum,
  use_cases: z.array(z.string().min(1)).min(1),
  team_adoption: teamAdoptionEnum,
  concrete_example: z.string().max(255).nullable().optional(),
  model_selection: freqEnum,
  multimodal_use: freqEnum,
  workflow_reuse: freqEnum,
  prompt_comfort: promptSkillEnum,
  prompt_iteration: freqEnum,
  refine_scenario: refineScenarioEnum,
  professional_attitude: attitudeEnum,
  data_safety_check: freqEnum,
  publish_unchecked: freqEnum,
  biggest_challenge: z.string().min(1),
  training_expectation: z.string().min(1),
  motivation: motivationEnum,
});

export const createRouter = createTRPCRouter({
  preAssessment: ailMemberProcedure
    .input(preAssessmentInputSchema)
    .mutation(async (opts) => {
      const memberId = opts.ctx.ail_member.id;

      const existing = await opts.ctx.prisma.ailPreAssessment.findUnique({
        where: { member_id: memberId },
        select: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Pre-assessment already submitted.",
        });
      }

      const data = opts.input;
      // Persist the raw answers and seed the report row (status="pending")
      // atomically — the report must never be missing for a submitted
      // assessment, otherwise the worker has nothing to update.
      const created = await opts.ctx.prisma.$transaction(async (tx) => {
        const preAssessment = await tx.ailPreAssessment.create({
          data: {
            member_id: memberId,
            ai_use_frequency: data.ai_use_frequency,
            ai_tools_used: data.ai_tools_used,
            ai_limitations: data.ai_limitations,
            output_review: data.output_review,
            use_cases: data.use_cases,
            team_adoption: data.team_adoption,
            concrete_example: data.concrete_example ?? null,
            model_selection: data.model_selection,
            multimodal_use: data.multimodal_use,
            workflow_reuse: data.workflow_reuse,
            prompt_comfort: data.prompt_comfort,
            prompt_iteration: data.prompt_iteration,
            refine_scenario: data.refine_scenario,
            professional_attitude: data.professional_attitude,
            data_safety_check: data.data_safety_check,
            publish_unchecked: data.publish_unchecked,
            biggest_challenge: data.biggest_challenge,
            training_expectation: data.training_expectation,
            motivation: data.motivation,
            report: {
              create: { status: "pending" },
            },
          },
        });
        return preAssessment;
      });

      // DB committed — kick off the background recommendation generation.
      // Best-effort: a publish failure leaves the report "pending" for the
      // user to retry from the report page, so we don't fail the submission.
      await schedulePreAssessmentReport(created.id).catch(() => {});

      return {
        code: STATUS_OK,
        message: "Pre-assessment submitted",
        id: created.id,
      };
    }),

  // Retry the AI recommendation generation when it previously failed (or got
  // stuck). Resets the report to "pending" and re-queues the worker.
  regeneratePreAssessmentReport: ailMemberProcedure.mutation(async (opts) => {
    const memberId = opts.ctx.ail_member.id;

    const preAssessment = await opts.ctx.prisma.ailPreAssessment.findUnique({
      where: { member_id: memberId },
      select: { id: true, report: { select: { status: true } } },
    });
    if (!preAssessment) {
      throw new TRPCError({
        code: STATUS_NOT_FOUND,
        message: "Pre-assessment not found.",
      });
    }

    // Upsert: heals legacy rows that have no report yet, and resets existing
    // ones back to pending so the worker overwrites them cleanly.
    await opts.ctx.prisma.ailPreAssessmentReport.upsert({
      where: { pre_assessment_id: preAssessment.id },
      create: { pre_assessment_id: preAssessment.id, status: "pending" },
      update: {
        status: "pending",
        error_message: null,
        recommendations: Prisma.DbNull,
      },
    });

    await schedulePreAssessmentReport(preAssessment.id).catch(() => {});

    return { code: STATUS_OK, message: "Report regeneration queued" };
  }),

  completeMaterial: ailMemberProcedure
    .input(z.object({ material_id: z.string().min(1) }))
    .mutation(async (opts) => {
      const memberId = opts.ctx.ail_member.id;
      const materialId = opts.input.material_id;

      const material = await opts.ctx.prisma.ailMaterial.findUnique({
        where: { id: materialId },
      });
      if (!material) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Material not found.",
        });
      }

      // Idempotent: composite PK prevents duplicate completion
      await opts.ctx.prisma.ailMaterialCompletion.upsert({
        where: {
          member_id_material_id: {
            member_id: memberId,
            material_id: materialId,
          },
        },
        create: { member_id: memberId, material_id: materialId },
        update: {},
      });

      // Award XP only on first completion
      const existingXp = await opts.ctx.prisma.ailXpEarning.findUnique({
        where: {
          member_id_learning_type_learning_id: {
            member_id: memberId,
            learning_type: "MATERIAL",
            learning_id: materialId,
          },
        },
      });
      let xpAwarded = 0;
      if (!existingXp) {
        await opts.ctx.prisma.ailXpEarning.create({
          data: {
            member_id: memberId,
            learning_type: "MATERIAL",
            learning_id: materialId,
            xp_earned: material.xp_reward,
          },
        });
        xpAwarded = material.xp_reward;
      }

      return {
        code: STATUS_OK,
        message: "Success",
        xp_awarded: xpAwarded,
      };
    }),

  completeVideo: ailMemberProcedure
    .input(z.object({ video_id: z.number().int().positive() }))
    .mutation(async (opts) => {
      const memberId = opts.ctx.ail_member.id;
      const videoId = opts.input.video_id;

      const video = await opts.ctx.prisma.ailVideo.findUnique({
        where: { id: videoId },
      });
      if (!video) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Video not found.",
        });
      }

      // Idempotent: composite PK prevents duplicate completion
      await opts.ctx.prisma.ailVideoCompletion.upsert({
        where: {
          member_id_video_id: {
            member_id: memberId,
            video_id: videoId,
          },
        },
        create: { member_id: memberId, video_id: videoId },
        update: {},
      });

      // Award XP only on first completion (learning_id stored as string)
      const learningIdStr = String(videoId);
      const existingXp = await opts.ctx.prisma.ailXpEarning.findUnique({
        where: {
          member_id_learning_type_learning_id: {
            member_id: memberId,
            learning_type: "VIDEO",
            learning_id: learningIdStr,
          },
        },
      });
      let xpAwarded = 0;
      if (!existingXp) {
        await opts.ctx.prisma.ailXpEarning.create({
          data: {
            member_id: memberId,
            learning_type: "VIDEO",
            learning_id: learningIdStr,
            xp_earned: video.xp_reward,
          },
        });
        xpAwarded = video.xp_reward;
      }

      return {
        code: STATUS_OK,
        message: "Success",
        xp_awarded: xpAwarded,
      };
    }),

  coachingNote: championProcedure
    .input(
      z.object({
        member_id: z.number().int().positive(),
        text: z.string().trim().min(1).max(1000),
      })
    )
    .mutation(async (opts) => {
      const championId = opts.ctx.ail_member.id;
      const { member_id, text } = opts.input;

      // Champion hanya boleh memberi catatan ke member di grup yg dia pimpin.
      const member = await opts.ctx.prisma.ailMember.findUnique({
        where: { id: member_id },
        select: { group: { select: { champion_id: true } } },
      });
      if (!member || member.group?.champion_id !== championId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only add notes to members in groups you lead.",
        });
      }

      const note = await opts.ctx.prisma.ailCoachingNote.create({
        data: { member_id, champion_id: championId, text },
      });

      return { code: STATUS_OK, message: "Catatan tersimpan", id: note.id };
    }),

  assignPrompt: championProcedure
    .input(assignInputSchema)
    .mutation(async (opts) => {
      const championId = opts.ctx.ail_member.id;
      const { library_id, target_type, target_ids, deadline, message } =
        opts.input;

      const deadlineDate = new Date(deadline);
      if (deadlineDate.getTime() <= Date.now()) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Deadline must be in the future.",
        });
      }

      const prompt = await opts.ctx.prisma.ailPrompt.findFirst({
        where: { id: library_id, status: "ACTIVE" },
        select: { id: true },
      });
      if (!prompt) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Prompt not found.",
        });
      }

      const memberIds = await resolveAssignmentTargets(
        opts.ctx.prisma,
        championId,
        target_type,
        target_ids
      );
      if (memberIds.length === 0) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "No target members.",
        });
      }

      const result = await opts.ctx.prisma.ailPromptSubmission.createMany({
        data: memberIds.map((mid) => ({
          member_id: mid,
          prompt_id: library_id,
          assigned_by_id: championId,
          deadline: deadlineDate,
          message: message ?? null,
        })),
        skipDuplicates: true,
      });

      return {
        code: STATUS_OK,
        message: "Assignments created",
        assigned_count: result.count,
        target_total: memberIds.length,
        skipped: memberIds.length - result.count,
      };
    }),

  assignUseCase: championProcedure
    .input(assignInputSchema)
    .mutation(async (opts) => {
      const championId = opts.ctx.ail_member.id;
      const { library_id, target_type, target_ids, deadline, message } =
        opts.input;

      const deadlineDate = new Date(deadline);
      if (deadlineDate.getTime() <= Date.now()) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Deadline must be in the future.",
        });
      }

      const useCase = await opts.ctx.prisma.ailUseCase.findFirst({
        where: { id: library_id, status: "ACTIVE" },
        select: { id: true },
      });
      if (!useCase) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Use case not found.",
        });
      }

      const memberIds = await resolveAssignmentTargets(
        opts.ctx.prisma,
        championId,
        target_type,
        target_ids
      );
      if (memberIds.length === 0) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "No target members.",
        });
      }

      const result = await opts.ctx.prisma.ailUseCaseSubmission.createMany({
        data: memberIds.map((mid) => ({
          member_id: mid,
          use_case_id: library_id,
          assigned_by_id: championId,
          deadline: deadlineDate,
          message: message ?? null,
        })),
        skipDuplicates: true,
      });

      return {
        code: STATUS_OK,
        message: "Assignments created",
        assigned_count: result.count,
        target_total: memberIds.length,
        skipped: memberIds.length - result.count,
      };
    }),

  promptAssignment: championProcedure
    .input(createPromptAssignmentSchema)
    .mutation(async (opts) => {
      const championId = opts.ctx.ail_member.id;
      const { name, description, expected_output, category_ids, assignment } =
        opts.input;

      const uniqueCategoryIds = Array.from(new Set(category_ids));
      const categories = await opts.ctx.prisma.ailCategory.findMany({
        where: { id: { in: uniqueCategoryIds } },
        select: { id: true },
      });
      if (categories.length !== uniqueCategoryIds.length) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Some categories were not found.",
        });
      }

      const level = await opts.ctx.prisma.ailLevel.findUnique({
        where: { level_number: 2 },
        select: { id: true },
      });
      if (!level) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Prompt level (L2) not found.",
        });
      }

      let memberIds: number[] = [];
      let deadlineDate: Date | null = null;
      if (assignment) {
        deadlineDate = new Date(assignment.deadline);
        if (deadlineDate.getTime() <= Date.now()) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "Deadline must be in the future.",
          });
        }
        memberIds = await resolveAssignmentTargets(
          opts.ctx.prisma,
          championId,
          assignment.target_type,
          assignment.target_ids
        );
        if (memberIds.length === 0) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "No target members.",
          });
        }
      }

      const result = await opts.ctx.prisma.$transaction(async (tx) => {
        const prompt = await tx.ailPrompt.create({
          data: {
            level_id: level.id,
            name,
            scenario: description,
            expected_output,
            status: "ACTIVE",
            categories: {
              create: uniqueCategoryIds.map((cid) => ({
                category: { connect: { id: cid } },
              })),
            },
          },
          select: { id: true },
        });

        let assignedCount = 0;
        if (assignment && deadlineDate && memberIds.length > 0) {
          const sub = await tx.ailPromptSubmission.createMany({
            data: memberIds.map((mid) => ({
              member_id: mid,
              prompt_id: prompt.id,
              assigned_by_id: championId,
              deadline: deadlineDate!,
              message: assignment.message ?? null,
            })),
            skipDuplicates: true,
          });
          assignedCount = sub.count;
        }

        return { promptId: prompt.id, assignedCount };
      });

      return {
        code: STATUS_OK,
        message: "Prompt assignment created",
        prompt_id: result.promptId,
        assigned_count: result.assignedCount,
        target_total: memberIds.length,
        skipped: memberIds.length - result.assignedCount,
      };
    }),

  useCaseAssignment: championProcedure
    .input(createUseCaseAssignmentSchema)
    .mutation(async (opts) => {
      const championId = opts.ctx.ail_member.id;
      const { name, description, category_ids, assignment } = opts.input;

      const uniqueCategoryIds = Array.from(new Set(category_ids));
      const categories = await opts.ctx.prisma.ailCategory.findMany({
        where: { id: { in: uniqueCategoryIds } },
        select: { id: true },
      });
      if (categories.length !== uniqueCategoryIds.length) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Some categories were not found.",
        });
      }

      const level = await opts.ctx.prisma.ailLevel.findUnique({
        where: { level_number: 3 },
        select: { id: true },
      });
      if (!level) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Use case level (L3) not found.",
        });
      }

      let memberIds: number[] = [];
      let deadlineDate: Date | null = null;
      if (assignment) {
        deadlineDate = new Date(assignment.deadline);
        if (deadlineDate.getTime() <= Date.now()) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "Deadline must be in the future.",
          });
        }
        memberIds = await resolveAssignmentTargets(
          opts.ctx.prisma,
          championId,
          assignment.target_type,
          assignment.target_ids
        );
        if (memberIds.length === 0) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "No target members.",
          });
        }
      }

      const result = await opts.ctx.prisma.$transaction(async (tx) => {
        const useCase = await tx.ailUseCase.create({
          data: {
            level_id: level.id,
            name,
            description,
            status: "ACTIVE",
            categories: {
              create: uniqueCategoryIds.map((cid) => ({
                category: { connect: { id: cid } },
              })),
            },
          },
          select: { id: true },
        });

        let assignedCount = 0;
        if (assignment && deadlineDate && memberIds.length > 0) {
          const sub = await tx.ailUseCaseSubmission.createMany({
            data: memberIds.map((mid) => ({
              member_id: mid,
              use_case_id: useCase.id,
              assigned_by_id: championId,
              deadline: deadlineDate!,
              message: assignment.message ?? null,
            })),
            skipDuplicates: true,
          });
          assignedCount = sub.count;
        }

        return { useCaseId: useCase.id, assignedCount };
      });

      return {
        code: STATUS_OK,
        message: "Use case assignment created",
        use_case_id: result.useCaseId,
        assigned_count: result.assignedCount,
        target_total: memberIds.length,
        skipped: memberIds.length - result.assignedCount,
      };
    }),

  // ── Self-initiated practice ──────────────────────────────────────────────
  // A student logs a prompt / use case they did on their own. Unlike the
  // champion-assigned flow, the student authors the library item AND submits
  // their work in one shot. The entry is routed to the student's group champion
  // (assigned_by_id) so it lands in the champion's review queue exactly like an
  // assigned task that's already been submitted (status: AWAITING_REVIEW).

  selfAssignPrompt: ailMemberProcedure
    .input(z.object({ prompt_id: z.number().int().positive() }))
    .mutation(async (opts) => {
      const member = opts.ctx.ail_member;
      const { prompt_id } = opts.input;

      const prompt = await opts.ctx.prisma.ailPrompt.findFirst({
        where: { id: prompt_id, status: "ACTIVE" },
        select: { id: true },
      });
      if (!prompt) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Prompt not found.",
        });
      }

      const existing = await opts.ctx.prisma.ailPromptSubmission.findUnique({
        where: {
          member_id_prompt_id: { member_id: member.id, prompt_id },
        },
        select: { id: true, assigned_by_id: true },
      });

      if (existing) {
        if (!existing.assigned_by_id) {
          const championId = await resolveMemberChampion(
            opts.ctx.prisma,
            member.group_id
          );
          await opts.ctx.prisma.ailPromptSubmission.update({
            where: { id: existing.id },
            data: { assigned_by_id: championId },
          });
        }
        return {
          code: STATUS_OK,
          message: "Prompt practice ready",
          prompt_id,
          submission_id: existing.id,
        };
      }

      const championId = await resolveMemberChampion(
        opts.ctx.prisma,
        member.group_id
      );
      const submission = await opts.ctx.prisma.ailPromptSubmission.create({
        data: {
          member_id: member.id,
          prompt_id,
          assigned_by_id: championId,
        },
        select: { id: true },
      });

      return {
        code: STATUS_OK,
        message: "Prompt practice ready",
        prompt_id,
        submission_id: submission.id,
      };
    }),

  selfAssignUseCase: ailMemberProcedure
    .input(z.object({ use_case_id: z.number().int().positive() }))
    .mutation(async (opts) => {
      const member = opts.ctx.ail_member;
      const { use_case_id } = opts.input;

      const useCase = await opts.ctx.prisma.ailUseCase.findFirst({
        where: { id: use_case_id, status: "ACTIVE" },
        select: { id: true },
      });
      if (!useCase) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Use case not found.",
        });
      }

      const existing = await opts.ctx.prisma.ailUseCaseSubmission.findUnique({
        where: {
          member_id_use_case_id: { member_id: member.id, use_case_id },
        },
        select: { id: true, assigned_by_id: true },
      });

      if (existing) {
        if (!existing.assigned_by_id) {
          const championId = await resolveMemberChampion(
            opts.ctx.prisma,
            member.group_id
          );
          await opts.ctx.prisma.ailUseCaseSubmission.update({
            where: { id: existing.id },
            data: { assigned_by_id: championId },
          });
        }
        return {
          code: STATUS_OK,
          message: "Use case practice ready",
          use_case_id,
          submission_id: existing.id,
        };
      }

      const championId = await resolveMemberChampion(
        opts.ctx.prisma,
        member.group_id
      );
      const submission = await opts.ctx.prisma.ailUseCaseSubmission.create({
        data: {
          member_id: member.id,
          use_case_id,
          assigned_by_id: championId,
        },
        select: { id: true },
      });

      return {
        code: STATUS_OK,
        message: "Use case practice ready",
        use_case_id,
        submission_id: submission.id,
      };
    }),

  selfPrompt: ailMemberProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(255),
        scenario: z.string().trim().min(1),
        input: z.string().trim().min(1).max(5000),
        output: z.string().trim().min(1).max(10000),
        category_ids: z
          .array(z.number().int().positive())
          .min(1, "Pilih minimal 1 kategori.")
          .max(2, "Maksimal 2 kategori."),
      })
    )
    .mutation(async (opts) => {
      const member = opts.ctx.ail_member;
      const { name, scenario, input, output, category_ids } = opts.input;

      const championId = await resolveMemberChampion(
        opts.ctx.prisma,
        member.group_id
      );

      const uniqueCategoryIds = Array.from(new Set(category_ids));
      const categories = await opts.ctx.prisma.ailCategory.findMany({
        where: { id: { in: uniqueCategoryIds } },
        select: { id: true },
      });
      if (categories.length !== uniqueCategoryIds.length) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Some categories were not found.",
        });
      }

      const level = await opts.ctx.prisma.ailLevel.findUnique({
        where: { level_number: 2 },
        select: { id: true },
      });
      if (!level) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Prompt level (L2) not found.",
        });
      }

      const result = await opts.ctx.prisma.$transaction(async (tx) => {
        const prompt = await tx.ailPrompt.create({
          data: {
            level_id: level.id,
            name,
            scenario,
            // Self-practice has no champion-defined target output.
            expected_output: SELF_PRACTICE_PLACEHOLDER,
            status: "ACTIVE",
            is_self_created: true,
            categories: {
              create: uniqueCategoryIds.map((cid) => ({
                category: { connect: { id: cid } },
              })),
            },
          },
          select: { id: true },
        });

        const submission = await tx.ailPromptSubmission.create({
          data: {
            member_id: member.id,
            prompt_id: prompt.id,
            assigned_by_id: championId,
            input,
            output,
            submitted_at: new Date(),
          },
          select: { id: true },
        });

        return { promptId: prompt.id, submissionId: submission.id };
      });

      return {
        code: STATUS_OK,
        message: "Self prompt practice submitted",
        prompt_id: result.promptId,
        submission_id: result.submissionId,
      };
    }),

  selfUseCase: ailMemberProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(255),
        category_ids: z
          .array(z.number().int().positive())
          .min(1, "Pilih minimal 1 kategori.")
          .max(2, "Maksimal 2 kategori."),
        outcome_proof: z.string().trim().min(1).max(500),
        hours_with_ai: z.number().min(0).max(9999.99),
        hours_without_ai: z.number().min(0).max(9999.99),
        description: z.string().trim().min(1).max(5000),
        ai_tool: z.string().trim().min(1).max(255),
        frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "OCCASIONALLY"]),
        type: z.enum([
          "WORKFLOW_AUTOMATION",
          "CONTENT_CREATION",
          "DATA_ANALYSIS",
          "RESEARCH",
          "COMMUNICATION",
          "DECISION_SUPPORT",
          "LEARNING",
          "OTHER",
        ]),
      })
    )
    .mutation(async (opts) => {
      const member = opts.ctx.ail_member;
      const {
        name,
        category_ids,
        outcome_proof,
        hours_with_ai,
        hours_without_ai,
        description,
        ai_tool,
        frequency,
        type,
      } = opts.input;

      const championId = await resolveMemberChampion(
        opts.ctx.prisma,
        member.group_id
      );

      const uniqueCategoryIds = Array.from(new Set(category_ids));
      const categories = await opts.ctx.prisma.ailCategory.findMany({
        where: { id: { in: uniqueCategoryIds } },
        select: { id: true },
      });
      if (categories.length !== uniqueCategoryIds.length) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Some categories were not found.",
        });
      }

      const level = await opts.ctx.prisma.ailLevel.findUnique({
        where: { level_number: 3 },
        select: { id: true },
      });
      if (!level) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Use case level (L3) not found.",
        });
      }

      const result = await opts.ctx.prisma.$transaction(async (tx) => {
        const useCase = await tx.ailUseCase.create({
          data: {
            level_id: level.id,
            name,
            // The student's write-up doubles as the use case description.
            description,
            status: "ACTIVE",
            is_self_created: true,
            categories: {
              create: uniqueCategoryIds.map((cid) => ({
                category: { connect: { id: cid } },
              })),
            },
          },
          select: { id: true },
        });

        const submission = await tx.ailUseCaseSubmission.create({
          data: {
            member_id: member.id,
            use_case_id: useCase.id,
            assigned_by_id: championId,
            outcome_proof,
            hours_with_ai,
            hours_without_ai,
            description,
            ai_tool,
            frequency,
            type,
            submitted_at: new Date(),
          },
          select: { id: true },
        });

        return { useCaseId: useCase.id, submissionId: submission.id };
      });

      return {
        code: STATUS_OK,
        message: "Self use case practice submitted",
        use_case_id: result.useCaseId,
        submission_id: result.submissionId,
      };
    }),
});
