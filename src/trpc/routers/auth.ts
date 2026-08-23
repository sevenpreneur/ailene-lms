import { STATUS_OK } from "@/lib/status_code";
import { createTRPCRouter, loggedInProcedure } from "@/trpc/init";

export const authRouter = createTRPCRouter({
  checkAilMember: loggedInProcedure.query(async (opts) => {
    const ailMember = await opts.ctx.prisma.ailMember.findUnique({
      where: { user_id: opts.ctx.user.id },
      include: {
        current_level: true,
        group: true,
        championed_groups: {
          include: { _count: { select: { members: true } } },
          orderBy: { created_at: "asc" },
        },
      },
    });
    if (!ailMember) {
      return {
        code: STATUS_OK,
        message: "Success",
        ail_member: null,
      };
    }
    const [xpAgg, preAssessment] = await Promise.all([
      opts.ctx.prisma.ailXpEarning.aggregate({
        _sum: { xp_earned: true },
        where: { member_id: ailMember.id },
      }),
      opts.ctx.prisma.ailPreAssessment.findUnique({
        where: { member_id: ailMember.id },
        select: { id: true },
      }),
    ]);
    return {
      code: STATUS_OK,
      message: "Success",
      ail_member: {
        ...ailMember,
        total_xp: xpAgg._sum.xp_earned ?? 0,
        has_pre_assessment: !!preAssessment,
      },
    };
  }),

  // Lightweight gating check for server-side route guards (layouts/pages).
  // Returns only what guards need — role + pre-assessment completion — in a
  // single DB round trip. Avoids the heavy payload of checkAilMember
  // (championed_groups + _count, xp aggregate, level/group includes) which is
  // only needed by client dashboards. See getProgramGate() in src/lib/gate.ts
  // which caches this per-request so nested layouts share one query.
  checkAilGate: loggedInProcedure.query(async (opts) => {
    const ailMember = await opts.ctx.prisma.ailMember.findUnique({
      where: { user_id: opts.ctx.user.id },
      select: {
        id: true,
        role: true,
        pre_assessment: { select: { id: true } },
      },
    });
    if (!ailMember) {
      return {
        code: STATUS_OK,
        message: "Success",
        ail_member: null,
      };
    }
    return {
      code: STATUS_OK,
      message: "Success",
      ail_member: {
        id: ailMember.id,
        role: ailMember.role,
        has_pre_assessment: !!ailMember.pre_assessment,
      },
    };
  }),
});
