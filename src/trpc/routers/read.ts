import {
  STATUS_BAD_REQUEST,
  STATUS_NOT_FOUND,
  STATUS_OK,
} from "@/lib/status_code";
import {
  ailMemberProcedure,
  championProcedure,
  createTRPCRouter,
  sponsorProcedure,
} from "@/trpc/init";
import {
  aileneGroupRouter,
  aileneOutcomeRouter,
  ailenePreAssessmentOrg,
  aileneReportRouter,
} from "./ailene/_router.ailene";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { z } from "zod";

const promptAssignmentInclude = {
  prompt: {
    include: {
      level: {
        select: { id: true, level_number: true, name: true },
      },
      categories: {
        include: { category: { select: { id: true, name: true } } },
      },
    },
  },
  assigned_by: {
    select: {
      id: true,
      user: { select: { full_name: true, avatar: true } },
    },
  },
  reviewed_by: {
    select: {
      id: true,
      user: { select: { full_name: true, avatar: true } },
    },
  },
} as const;

const useCaseAssignmentInclude = {
  use_case: {
    include: {
      level: {
        select: { id: true, level_number: true, name: true },
      },
      categories: {
        include: { category: { select: { id: true, name: true } } },
      },
    },
  },
  assigned_by: {
    select: {
      id: true,
      user: { select: { full_name: true, avatar: true } },
    },
  },
  reviewed_by: {
    select: {
      id: true,
      user: { select: { full_name: true, avatar: true } },
    },
  },
} as const;

async function resolveMemberChampion(
  prisma: PrismaClient,
  memberGroupId: number | null
): Promise<number> {
  if (!memberGroupId) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message:
        "Kamu belum tergabung dalam grup, jadi belum bisa membuka latihan mandiri.",
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

export const readRouter = createTRPCRouter({
  // Coaching notes left for the logged-in member by their champion(s), newest
  // first. Drives the "Catatan dari Champion" section on the student dashboard.
  coachingNotes: ailMemberProcedure.query(async (opts) => {
    const memberId = opts.ctx.ail_member.id;
    const notes = await opts.ctx.prisma.ailCoachingNote.findMany({
      where: { member_id: memberId },
      orderBy: { created_at: "desc" },
      include: {
        champion: {
          select: {
            id: true,
            role: true,
            user: { select: { full_name: true, avatar: true } },
          },
        },
      },
    });
    return {
      code: STATUS_OK,
      message: "Success",
      notes: notes.map((n) => ({
        id: n.id,
        text: n.text,
        created_at: n.created_at,
        champion: {
          id: n.champion.id,
          role: n.champion.role,
          full_name: n.champion.user.full_name,
          avatar: n.champion.user.avatar,
        },
      })),
    };
  }),

  competencyProfile: ailMemberProcedure.query(async (opts) => {
    const memberId = opts.ctx.ail_member.id;
    const currentLevelNumber =
      opts.ctx.ail_member.current_level?.level_number ?? 0;
    const targetLevelNumber = Math.min(currentLevelNumber + 1, 4);

    const [quizSubs, prSubs, ucSubs] = await Promise.all([
      opts.ctx.prisma.ailQuizSubmission.findMany({
        where: { member_id: memberId, is_completed: true },
        select: { quiz_id: true, score: true },
      }),
      opts.ctx.prisma.ailPromptSubmission.findMany({
        where: { member_id: memberId, submitted_at: { not: null } },
        select: { is_accepted: true },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: { member_id: memberId, submitted_at: { not: null } },
        select: {
          ai_tool: true,
          frequency: true,
          type: true,
        },
      }),
    ]);

    const round1 = (n: number) => Math.round(n * 10) / 10;
    const clamp = (n: number, min: number, max: number) =>
      Math.max(min, Math.min(max, n));

    // 1. AI Foundation — best quiz score per quiz, averaged, normalized 0-100 → 0-5
    const bestPerQuiz = new Map<string, number>();
    for (const q of quizSubs) {
      const prev = bestPerQuiz.get(q.quiz_id);
      if (prev === undefined || q.score > prev) {
        bestPerQuiz.set(q.quiz_id, q.score);
      }
    }
    const avgQuiz =
      bestPerQuiz.size === 0
        ? 0
        : Array.from(bestPerQuiz.values()).reduce((a, b) => a + b, 0) /
          bestPerQuiz.size;
    const aiFoundation = clamp(avgQuiz / 20, 0, 5);

    // 2. Prompting Quality — acceptance rate across submitted prompts
    const prAcceptedCount = prSubs.filter((p) => p.is_accepted).length;
    const promptingQuality =
      prSubs.length === 0
        ? 0
        : clamp((prAcceptedCount / prSubs.length) * 5, 0, 5);

    // 3. Tool Fluency — unique AI tools used across all use case submissions
    const tools = new Set<string>();
    for (const uc of ucSubs) {
      if (!uc.ai_tool) continue;
      for (const raw of uc.ai_tool.split(",")) {
        const t = raw.trim().toLowerCase();
        if (t) tools.add(t);
      }
    }
    const toolFluency = Math.min(tools.size, 5);

    // 4. Use Case Diversity — total submitted use cases, capped at 5
    const useCaseDiversity = Math.min(ucSubs.length, 5);

    // 5. AI Habit — frequency weighted average across use case submissions
    const freqScore: Record<string, number> = {
      DAILY: 5,
      WEEKLY: 3.5,
      MONTHLY: 2,
      OCCASIONALLY: 1,
    };
    const freqValues = ucSubs
      .map((uc) => (uc.frequency ? (freqScore[uc.frequency] ?? 0) : 0))
      .filter((v) => v > 0);
    const aiHabit =
      freqValues.length === 0
        ? 0
        : freqValues.reduce((a, b) => a + b, 0) / freqValues.length;

    // 6. Agentic Capabilities — count of WORKFLOW_AUTOMATION use cases
    const agenticCount = ucSubs.filter(
      (uc) => uc.type === "WORKFLOW_AUTOMATION"
    ).length;
    const agenticCapabilities = Math.min(agenticCount, 5);

    const dimensions = [
      {
        key: "ai_foundation",
        name: "AI Foundation",
        score: round1(aiFoundation),
      },
      {
        key: "prompting_quality",
        name: "Prompting Quality",
        score: round1(promptingQuality),
      },
      { key: "tool_fluency", name: "Tool Fluency", score: round1(toolFluency) },
      {
        key: "use_case_diversity",
        name: "Use Case Diversity",
        score: round1(useCaseDiversity),
      },
      { key: "ai_habit", name: "AI Habit", score: round1(aiHabit) },
      {
        key: "agentic_capabilities",
        name: "Agentic Capabilities",
        score: round1(agenticCapabilities),
      },
    ];

    const avg = round1(
      dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length
    );

    // Tier label from overall avg
    let tier_number: number;
    let tier_name: string;
    if (avg < 1) {
      tier_number = 0;
      tier_name = "Beginner";
    } else if (avg < 2) {
      tier_number = 1;
      tier_name = "Explorer";
    } else if (avg < 3) {
      tier_number = 2;
      tier_name = "Operator";
    } else if (avg < 4) {
      tier_number = 3;
      tier_name = "Builder";
    } else {
      tier_number = 4;
      tier_name = "Master";
    }

    // Next tier preview
    const next_tier =
      tier_number >= 4
        ? null
        : {
            number: tier_number + 1,
            name: ["Explorer", "Operator", "Builder", "Master"][tier_number],
            avg_needed: round1(tier_number + 1 - avg),
          };

    return {
      code: STATUS_OK,
      message: "Success",
      profile: {
        dimensions,
        avg,
        current_level_number: currentLevelNumber,
        target_level_number: targetLevelNumber,
        tier_number,
        tier_name,
        next_tier,
      },
    };
  }),

  // Rekomendasi use case mandiri dari katalog. Hanya ambil use case yang
  // belum pernah dibuatkan submission oleh member ini.
  recommendations: ailMemberProcedure.query(async (opts) => {
    const memberId = opts.ctx.ail_member.id;

    const me = await opts.ctx.prisma.ailMember.findUnique({
      where: { id: memberId },
      select: {
        current_level_id: true,
        job_title: true,
        group: { select: { name: true } },
        current_level: { select: { id: true, level_number: true } },
      },
    });
    if (!me) {
      return {
        code: STATUS_OK,
        message: "Success",
        level_number: 0,
        role: null,
        department: null,
        items: [],
      };
    }

    const levelNumber = me.current_level?.level_number ?? 0;
    const role = me.job_title ?? null;
    const department = me.group?.name ?? null;
    const hint = `${role ?? ""} ${department ?? ""}`.toLowerCase();

    const doneUc = await opts.ctx.prisma.ailUseCaseSubmission.findMany({
      where: { member_id: memberId },
      select: { use_case_id: true },
    });
    const doneUcIds = doneUc
      .map((x) => x.use_case_id)
      .filter((x): x is number => x != null);

    const useCases = await opts.ctx.prisma.ailUseCase.findMany({
      where: {
        status: "ACTIVE",
        is_self_created: false,
        ...(doneUcIds.length ? { id: { notIn: doneUcIds } } : {}),
      },
      orderBy: [{ level: { level_number: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        level: { select: { level_number: true } },
        categories: { select: { category: { select: { name: true } } } },
      },
      take: 24,
    });

    type Rec = {
      id: number;
      title: string;
      description: string;
      category: string | null;
      level_number: number;
    };
    const ucItems: Rec[] = useCases.map((u) => ({
      id: u.id,
      title: u.name,
      description: u.description,
      category: u.categories[0]?.category.name ?? null,
      level_number: u.level.level_number,
    }));

    const relevance = (r: Rec) =>
      r.category && hint.includes(r.category.toLowerCase()) ? 1 : 0;
    const byRelevance = (a: Rec, b: Rec) => {
      const rel = relevance(b) - relevance(a);
      if (rel !== 0) return rel;
      const levelDistance =
        Math.abs(a.level_number - levelNumber) -
        Math.abs(b.level_number - levelNumber);
      if (levelDistance !== 0) return levelDistance;
      return a.title.localeCompare(b.title);
    };
    const items = ucItems.sort(byRelevance).slice(0, 3);

    return {
      code: STATUS_OK,
      message: "Success",
      level_number: levelNumber,
      role,
      department,
      items,
    };
  }),

  firstWin: ailMemberProcedure.query(async (opts) => {
    const memberId = opts.ctx.ail_member.id;

    // Find the earliest submission across both kinds — this is the user's
    // true "first win" milestone and the card commemorates it permanently.
    const [earliestUc, earliestPr] = await Promise.all([
      opts.ctx.prisma.ailUseCaseSubmission.findFirst({
        where: { member_id: memberId, submitted_at: { not: null } },
        orderBy: { submitted_at: "asc" },
        include: { use_case: { select: { name: true } } },
      }),
      opts.ctx.prisma.ailPromptSubmission.findFirst({
        where: { member_id: memberId, submitted_at: { not: null } },
        orderBy: { submitted_at: "asc" },
        include: { prompt: { select: { name: true } } },
      }),
    ]);

    if (!earliestUc && !earliestPr) {
      return { code: STATUS_OK, message: "Success", first_win: null };
    }

    // Each kind has its own "first" milestone. If both exist, surface the
    // one whose first submission happened most recently — the milestone the
    // user just unlocked.
    const ucWins =
      earliestUc &&
      (!earliestPr ||
        (earliestUc.submitted_at as Date) > (earliestPr.submitted_at as Date));

    if (ucWins && earliestUc) {
      return {
        code: STATUS_OK,
        message: "Success",
        first_win: {
          kind: "use_case" as const,
          name: earliestUc.use_case.name,
          hours_saved: earliestUc.hours_saved,
          hours_without_ai: earliestUc.hours_without_ai,
          submitted_at: earliestUc.submitted_at,
        },
      };
    }

    return {
      code: STATUS_OK,
      message: "Success",
      first_win: {
        kind: "prompt" as const,
        name: earliestPr!.prompt.name,
        submitted_at: earliestPr!.submitted_at,
      },
    };
  }),

  announcement: ailMemberProcedure.query(async (opts) => {
    const announcement = await opts.ctx.prisma.aileneAnnouncement.findUnique({
      where: { id: 1 },
    });
    return {
      code: STATUS_OK,
      message: "Success",
      announcement,
    };
  }),

  preAssessment: createTRPCRouter({
    // member-scoped: the logged-in member's own pre-assessment
    mine: ailMemberProcedure.query(async (opts) => {
      const memberId = opts.ctx.ail_member.id;
      const pa = await opts.ctx.prisma.ailPreAssessment.findUnique({
        where: { member_id: memberId },
      });
      return {
        code: STATUS_OK,
        message: "Success",
        pre_assessment: pa,
      };
    }),
    // sponsor-scoped org aggregations (live in ailene/_router.ailene)
    ...ailenePreAssessmentOrg,
  }),
  group: aileneGroupRouter,
  outcome: aileneOutcomeRouter,
  report: aileneReportRouter,

  materialDetail: ailMemberProcedure
    .input(z.object({ material_id: z.string().min(1) }))
    .query(async (opts) => {
      const memberId = opts.ctx.ail_member.id;
      const { material_id } = opts.input;

      const material = await opts.ctx.prisma.ailMaterial.findUnique({
        where: { id: material_id },
        include: { chapter: { select: { id: true, name: true } } },
      });
      if (!material) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Material not found.",
        });
      }

      const [completion, xp] = await Promise.all([
        opts.ctx.prisma.ailMaterialCompletion.findUnique({
          where: {
            member_id_material_id: {
              member_id: memberId,
              material_id: material.id,
            },
          },
        }),
        opts.ctx.prisma.ailXpEarning.findUnique({
          where: {
            member_id_learning_type_learning_id: {
              member_id: memberId,
              learning_type: "MATERIAL",
              learning_id: material.id,
            },
          },
        }),
      ]);

      return {
        code: STATUS_OK,
        message: "Success",
        material: {
          id: material.id,
          title: material.title,
          description: material.description,
          content: material.content,
          file_url: material.file_url,
          xp_reward: material.xp_reward,
          chapter: material.chapter,
          created_at: material.created_at,
          updated_at: material.updated_at,
        },
        completed: !!completion,
        completed_at: completion?.completed_at ?? null,
        xp_earned: xp?.xp_earned ?? 0,
      };
    }),

  // Other learning materials within the same level as the given material,
  // numbered sequentially (e.g. "2.5") with completion + lock status — used by
  // the "Modul lain di level ini" sidebar on the material detail page.
  levelMaterials: ailMemberProcedure
    .input(z.object({ material_id: z.string().min(1) }))
    .query(async (opts) => {
      const memberId = opts.ctx.ail_member.id;
      const currentLevelNumber =
        opts.ctx.ail_member.current_level?.level_number ?? 0;
      const { material_id } = opts.input;

      const current = await opts.ctx.prisma.ailMaterial.findUnique({
        where: { id: material_id },
        select: { chapter: { select: { level_id: true } } },
      });
      if (!current) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Material not found.",
        });
      }
      const levelId = current.chapter.level_id;

      const [level, chapters] = await Promise.all([
        opts.ctx.prisma.ailLevel.findUnique({
          where: { id: levelId },
          select: { level_number: true },
        }),
        opts.ctx.prisma.ailChapter.findMany({
          where: { level_id: levelId, status: "ACTIVE" },
          orderBy: { session_date: "asc" },
          select: {
            session_date: true,
            materials: {
              where: { status: "ACTIVE" },
              orderBy: { order_index: "asc" },
              select: { id: true, title: true },
            },
          },
        }),
      ]);

      const levelNumber = level?.level_number ?? 0;
      const levelUnlocked = levelNumber <= currentLevelNumber;

      const allIds = chapters.flatMap((ch) => ch.materials.map((m) => m.id));
      const completions =
        allIds.length === 0
          ? []
          : await opts.ctx.prisma.ailMaterialCompletion.findMany({
              where: { member_id: memberId, material_id: { in: allIds } },
              select: { material_id: true },
            });
      const doneSet = new Set(completions.map((c) => c.material_id));

      const now = dayjs();
      let counter = 0;
      const materials: {
        id: string;
        title: string;
        index: number;
        completed: boolean;
        locked: boolean;
        is_current: boolean;
      }[] = [];
      for (const ch of chapters) {
        const sessionStarted = !dayjs(ch.session_date).isAfter(now);
        const unlocked = levelUnlocked && sessionStarted;
        for (const m of ch.materials) {
          counter += 1;
          materials.push({
            id: m.id,
            title: m.title,
            index: counter,
            completed: doneSet.has(m.id),
            locked: !unlocked,
            is_current: m.id === material_id,
          });
        }
      }

      return {
        code: STATUS_OK,
        message: "Success",
        level_number: levelNumber,
        materials,
      };
    }),

  quizResult: ailMemberProcedure
    .input(z.object({ quiz_id: z.string().min(1) }))
    .query(async (opts) => {
      const memberId = opts.ctx.ail_member.id;
      const { quiz_id } = opts.input;

      const quiz = await opts.ctx.prisma.ailQuiz.findUnique({
        where: { id: quiz_id },
        include: {
          chapter: { select: { id: true, name: true } },
          questions: {
            orderBy: { order_index: "asc" },
            include: { options: { orderBy: { id: "asc" } } },
          },
        },
      });
      if (!quiz) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Quiz not found.",
        });
      }

      const [latestCompleted, xp] = await Promise.all([
        opts.ctx.prisma.ailQuizSubmission.findFirst({
          where: { member_id: memberId, quiz_id, is_completed: true },
          orderBy: { attempt_number: "desc" },
        }),
        opts.ctx.prisma.ailXpEarning.findUnique({
          where: {
            member_id_learning_type_learning_id: {
              member_id: memberId,
              learning_type: "QUIZ",
              learning_id: quiz_id,
            },
          },
        }),
      ]);

      if (!latestCompleted) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Quiz submission not found.",
        });
      }

      return {
        code: STATUS_OK,
        message: "Success",
        quiz: {
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          chapter: quiz.chapter,
        },
        questions: quiz.questions,
        submission: {
          attempt_number: latestCompleted.attempt_number,
          score: latestCompleted.score,
          answers: latestCompleted.answers,
          submitted_at: latestCompleted.submitted_at,
        },
        xp_earned: xp?.xp_earned ?? 0,
      };
    }),

  todayFocus: ailMemberProcedure.query(async (opts) => {
    const memberId = opts.ctx.ail_member.id;
    const currentLevelNumber =
      opts.ctx.ail_member.current_level?.level_number ?? 0;

    const [
      chapters,
      quizSubs,
      videoComps,
      materialComps,
      promptAssignments,
      useCaseAssignments,
    ] = await Promise.all([
      opts.ctx.prisma.ailChapter.findMany({
        where: { status: "ACTIVE" },
        orderBy: { session_date: "asc" },
        include: {
          level: true,
          quizzes: {
            where: { status: "ACTIVE" },
            orderBy: { order_index: "asc" },
          },
          videos: {
            where: { status: "ACTIVE" },
            orderBy: { order_index: "asc" },
          },
          materials: {
            where: { status: "ACTIVE" },
            orderBy: { order_index: "asc" },
          },
        },
      }),
      opts.ctx.prisma.ailQuizSubmission.findMany({
        where: { member_id: memberId, is_completed: true },
        select: { quiz_id: true },
      }),
      opts.ctx.prisma.ailVideoCompletion.findMany({
        where: { member_id: memberId },
        select: { video_id: true },
      }),
      opts.ctx.prisma.ailMaterialCompletion.findMany({
        where: { member_id: memberId },
        select: { material_id: true },
      }),
      opts.ctx.prisma.ailPromptSubmission.findMany({
        where: {
          member_id: memberId,
          assigned_by_id: { not: null },
          deadline: { not: null },
          submitted_at: null,
          prompt: { status: "ACTIVE" },
        },
        orderBy: [{ deadline: "asc" }, { created_at: "asc" }],
        include: {
          prompt: {
            select: {
              id: true,
              name: true,
              level: { select: { id: true, level_number: true, name: true } },
              categories: {
                select: { category: { select: { name: true } } },
                take: 1,
              },
            },
          },
          assigned_by: { select: { user: { select: { full_name: true } } } },
        },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: {
          member_id: memberId,
          assigned_by_id: { not: null },
          deadline: { not: null },
          submitted_at: null,
          use_case: { status: "ACTIVE" },
        },
        orderBy: [{ deadline: "asc" }, { created_at: "asc" }],
        include: {
          use_case: {
            select: {
              id: true,
              name: true,
              level: { select: { id: true, level_number: true, name: true } },
              categories: {
                select: { category: { select: { name: true } } },
                take: 1,
              },
            },
          },
          assigned_by: { select: { user: { select: { full_name: true } } } },
        },
      }),
    ]);

    const completedQuizIds = new Set(quizSubs.map((s) => s.quiz_id));
    const completedVideoIds = new Set(videoComps.map((v) => v.video_id));
    const completedMaterialIds = new Set(
      materialComps.map((m) => m.material_id)
    );

    type Focus = {
      kind:
        | "Quiz"
        | "Video"
        | "Material"
        | "PromptPractice"
        | "UseCasePractice";
      task_id: string;
      task_title: string;
      chapter_id: number | null;
      chapter_name: string | null;
      level_id: number | null;
      level_number: number | null;
      category: string | null;
      assigned_by_name: string | null;
      deadline?: Date | null;
      href: string;
    };
    let focus: Focus | null = null;

    const assignmentFocus = [
      ...promptAssignments.map((row) => ({
        kind: "PromptPractice" as const,
        task_id: String(row.prompt.id),
        task_title: row.prompt.name,
        chapter_id: null,
        chapter_name: row.prompt.level.name,
        level_id: row.prompt.level.id,
        level_number: row.prompt.level.level_number,
        category: row.prompt.categories[0]?.category.name ?? null,
        assigned_by_name: row.assigned_by?.user.full_name ?? null,
        deadline: row.deadline,
        href: `/student/skill-practice/prompts/${row.prompt.id}`,
      })),
      ...useCaseAssignments.map((row) => ({
        kind: "UseCasePractice" as const,
        task_id: String(row.use_case.id),
        task_title: row.use_case.name,
        chapter_id: null,
        chapter_name: row.use_case.level.name,
        level_id: row.use_case.level.id,
        level_number: row.use_case.level.level_number,
        category: row.use_case.categories[0]?.category.name ?? null,
        assigned_by_name: row.assigned_by?.user.full_name ?? null,
        deadline: row.deadline,
        href: `/student/skill-practice/use-cases/${row.use_case.id}`,
      })),
    ].sort((a, b) => {
      const aTime = a.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })[0];

    for (const ch of chapters) {
      if (ch.level.level_number > currentLevelNumber) continue;
      if (dayjs(ch.session_date).isAfter(dayjs())) continue;

      const m = ch.materials.find((x) => !completedMaterialIds.has(x.id));
      if (m) {
        focus = {
          kind: "Material",
          task_id: m.id,
          task_title: m.title,
          chapter_id: ch.id,
          chapter_name: ch.name,
          level_id: ch.level_id,
          level_number: ch.level.level_number,
          category: null,
          assigned_by_name: null,
          href: `/student/materials/${m.id}`,
        };
        break;
      }
      const q = ch.quizzes.find((x) => !completedQuizIds.has(x.id));
      if (q) {
        focus = {
          kind: "Quiz",
          task_id: q.id,
          task_title: q.name,
          chapter_id: ch.id,
          chapter_name: ch.name,
          level_id: ch.level_id,
          level_number: ch.level.level_number,
          category: null,
          assigned_by_name: null,
          href: `/student/quizzes/${q.id}`,
        };
        break;
      }
      if (assignmentFocus) {
        focus = assignmentFocus;
        break;
      }
      const v = ch.videos.find((x) => !completedVideoIds.has(x.id));
      if (v) {
        focus = {
          kind: "Video",
          task_id: String(v.id),
          task_title: v.title,
          chapter_id: ch.id,
          chapter_name: ch.name,
          level_id: ch.level_id,
          level_number: ch.level.level_number,
          category: null,
          assigned_by_name: null,
          href: v.video_url,
        };
        break;
      }
    }

    if (!focus && assignmentFocus) {
      focus = assignmentFocus;
    }

    return { code: STATUS_OK, message: "Success", focus };
  }),

  levelProgress: ailMemberProcedure.query(async (opts) => {
    const memberId = opts.ctx.ail_member.id;
    const currentLevel = opts.ctx.ail_member.current_level;
    const currentLevelNumber = currentLevel?.level_number ?? 0;

    const [xpAgg, levels, currentLevelChapters] = await Promise.all([
      opts.ctx.prisma.ailXpEarning.aggregate({
        _sum: { xp_earned: true },
        where: { member_id: memberId },
      }),
      opts.ctx.prisma.ailLevel.findMany({
        where: { status: "ACTIVE" },
        orderBy: { level_number: "asc" },
        select: {
          id: true,
          level_number: true,
          name: true,
          icon: true,
          min_xp: true,
        },
      }),
      opts.ctx.prisma.ailChapter.findMany({
        where: {
          status: "ACTIVE",
          level: { level_number: currentLevelNumber },
        },
        select: {
          quizzes: { where: { status: "ACTIVE" }, select: { id: true } },
          materials: { where: { status: "ACTIVE" }, select: { id: true } },
        },
      }),
    ]);

    const total_xp = xpAgg._sum.xp_earned ?? 0;
    const max_min_xp = levels.reduce((m, l) => Math.max(m, l.min_xp), 0);

    // Task-based unlock gate: quiz + material across all chapters at current
    // level. Videos don't count.
    const requiredQuizIds = currentLevelChapters.flatMap((c) =>
      c.quizzes.map((q) => q.id)
    );
    const requiredMaterialIds = currentLevelChapters.flatMap((c) =>
      c.materials.map((m) => m.id)
    );
    const tasksRequired = requiredQuizIds.length + requiredMaterialIds.length;

    const [doneQuizzes, doneMaterials] = await Promise.all([
      requiredQuizIds.length === 0
        ? []
        : opts.ctx.prisma.ailQuizSubmission.findMany({
            where: {
              member_id: memberId,
              quiz_id: { in: requiredQuizIds },
              is_completed: true,
            },
            select: { quiz_id: true },
            distinct: ["quiz_id"],
          }),
      requiredMaterialIds.length === 0
        ? []
        : opts.ctx.prisma.ailMaterialCompletion.findMany({
            where: {
              member_id: memberId,
              material_id: { in: requiredMaterialIds },
            },
            select: { material_id: true },
          }),
    ]);
    const tasksDone = doneQuizzes.length + doneMaterials.length;
    const next_level_unlockable = tasksDone >= tasksRequired;

    return {
      code: STATUS_OK,
      message: "Success",
      total_xp,
      max_min_xp,
      levels,
      current_level_number: currentLevelNumber,
      tasks_required: tasksRequired,
      tasks_done: tasksDone,
      next_level_unlockable,
    };
  }),

  organizationStats: sponsorProcedure.query(async (opts) => {
    const [member_count, group_count] = await Promise.all([
      opts.ctx.prisma.ailMember.count(),
      opts.ctx.prisma.ailGroup.count(),
    ]);
    return {
      code: STATUS_OK,
      message: "Success",
      member_count,
      group_count,
    };
  }),

  executiveView: sponsorProcedure.query(async (opts) => {
    const now = dayjs();
    const weeklyActiveThreshold = now.subtract(7, "day").toDate();
    const roiValuePerHour = 250000;

    const [members, useCaseSubmissions] = await Promise.all([
      opts.ctx.prisma.ailMember.findMany({
        select: {
          id: true,
          last_active_at: true,
          current_level: {
            select: {
              level_number: true,
            },
          },
        },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: { submitted_at: { not: null } },
        select: {
          hours_saved: true,
          hours_without_ai: true,
        },
      }),
    ]);

    const memberCount = members.length;
    const avgLevel =
      memberCount === 0
        ? 0
        : members.reduce(
            (sum, member) => sum + (member.current_level?.level_number ?? 0),
            0
          ) / memberCount;

    const activeWeeklyCount = members.filter(
      (member) =>
        member.last_active_at &&
        dayjs(member.last_active_at).isAfter(dayjs(weeklyActiveThreshold))
    ).length;

    let hoursSavedTotal = 0;
    for (const row of useCaseSubmissions) {
      if (row.hours_saved === null || row.hours_without_ai === null) continue;
      const saved = Number(row.hours_without_ai) - Number(row.hours_saved);
      if (saved > 0) hoursSavedTotal += saved;
    }

    const roiCohortToDate = hoursSavedTotal * roiValuePerHour;

    return {
      code: STATUS_OK,
      message: "Success",
      metrics: {
        avg_level: Math.round(avgLevel * 10) / 10,
        member_count: memberCount,
        hours_saved_total: Math.round(hoursSavedTotal * 10) / 10,
        roi_cohort_to_date: Math.round(roiCohortToDate),
        staff_active_weekly_count: activeWeeklyCount,
        staff_active_weekly_percent:
          memberCount === 0
            ? 0
            : Math.round((activeWeeklyCount / memberCount) * 100),
      },
    };
  }),

  // Headline KPI for the sponsor dashboard hero: % productive staff (≥ L1),
  // hours saved in the trailing week, annualized ROI run-rate, and a 12-week
  // hours-saved series for the sparkline. All from real submission data.
  headline: sponsorProcedure.query(async (opts) => {
    const now = dayjs();
    const roiValuePerHour = 250000; // kept in sync with executiveView
    const lastWeekThreshold = now.subtract(7, "day");
    const trendWeeks = 12;

    const [members, submissions] = await Promise.all([
      opts.ctx.prisma.ailMember.findMany({
        select: { id: true, current_level: { select: { level_number: true } } },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: { submitted_at: { not: null } },
        select: {
          hours_saved: true,
          hours_without_ai: true,
          submitted_at: true,
        },
      }),
    ]);

    const memberCount = members.length;
    // "Produktif" = sudah mencapai Level 1+.
    const productiveCount = members.filter(
      (m) => (m.current_level?.level_number ?? 0) >= 1
    ).length;
    const productivePercent =
      memberCount === 0
        ? 0
        : Math.round((productiveCount / memberCount) * 100);

    // Weekly buckets (oldest → newest) for the sparkline.
    const buckets = Array.from({ length: trendWeeks }, (_, i) => {
      const start = now.startOf("week").subtract(trendWeeks - 1 - i, "week");
      return {
        start,
        end: start.add(1, "week"),
        label: start.format("D MMM"),
        hours: 0,
      };
    });

    let hoursSavedLastWeek = 0;
    for (const row of submissions) {
      if (
        row.hours_saved === null ||
        row.hours_without_ai === null ||
        !row.submitted_at
      )
        continue;
      const saved = Number(row.hours_without_ai) - Number(row.hours_saved);
      if (saved <= 0) continue;
      const at = dayjs(row.submitted_at);
      if (at.isAfter(lastWeekThreshold)) hoursSavedLastWeek += saved;
      for (const b of buckets) {
        if (!at.isBefore(b.start) && at.isBefore(b.end)) {
          b.hours += saved;
          break;
        }
      }
    }

    const roiAnnualized = Math.round(hoursSavedLastWeek * 52 * roiValuePerHour);

    return {
      code: STATUS_OK,
      message: "Success",
      productive_percent: productivePercent,
      productive_count: productiveCount,
      member_count: memberCount,
      hours_saved_last_week: Math.round(hoursSavedLastWeek * 10) / 10,
      roi_annualized: roiAnnualized,
      trend: buckets.map((b) => ({
        label: b.label,
        hours: Math.round(b.hours * 10) / 10,
      })),
    };
  }),

  // Program-health metrics for the sponsor dashboard, all derived from real
  // data (no targets/deltas — we have no historical baseline yet). Each metric
  // is a percentage plus a human-readable "X dari Y" detail.
  programHealth: sponsorProcedure.query(async (opts) => {
    const [
      members,
      ucReviewed,
      ucAccepted,
      promptReviewed,
      promptAccepted,
      ucSubmitters,
      promptSubmitters,
    ] = await Promise.all([
      opts.ctx.prisma.ailMember.findMany({
        select: { id: true, current_level: { select: { level_number: true } } },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.count({
        where: { reviewed_at: { not: null } },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.count({
        where: { reviewed_at: { not: null }, is_accepted: true },
      }),
      opts.ctx.prisma.ailPromptSubmission.count({
        where: { reviewed_at: { not: null } },
      }),
      opts.ctx.prisma.ailPromptSubmission.count({
        where: { reviewed_at: { not: null }, is_accepted: true },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: { submitted_at: { not: null } },
        select: { member_id: true },
        distinct: ["member_id"],
      }),
      opts.ctx.prisma.ailPromptSubmission.findMany({
        where: { submitted_at: { not: null } },
        select: { member_id: true },
        distinct: ["member_id"],
      }),
    ]);

    const memberCount = members.length;
    const atL1 = members.filter(
      (m) => (m.current_level?.level_number ?? 0) >= 1
    ).length;
    const atL2 = members.filter(
      (m) => (m.current_level?.level_number ?? 0) >= 2
    ).length;

    const reviewedTotal = ucReviewed + promptReviewed;
    const acceptedTotal = ucAccepted + promptAccepted;

    const submitters = new Set<number>();
    for (const row of ucSubmitters) submitters.add(row.member_id);
    for (const row of promptSubmitters) submitters.add(row.member_id);

    const pct = (num: number, den: number) =>
      den === 0 ? 0 : Math.round((num / den) * 100);

    return {
      code: STATUS_OK,
      message: "Success",
      metrics: [
        {
          key: "pass_l1",
          label: "Lulus L1",
          name: "Capai Level 1+",
          percent: pct(atL1, memberCount),
          detail: `${atL1} dari ${memberCount} staff`,
        },
        {
          key: "pass_l2",
          label: "Lulus L2",
          name: "Capai Level 2+",
          percent: pct(atL2, memberCount),
          detail: `${atL2} dari ${memberCount} staff`,
        },
        {
          key: "accepted",
          label: "Submission diterima",
          name: "Hasil kerja di-ACC",
          percent: pct(acceptedTotal, reviewedTotal),
          detail: `${acceptedTotal} dari ${reviewedTotal} direview`,
        },
        {
          key: "participation",
          label: "Partisipasi",
          name: "Staff pernah submit",
          percent: pct(submitters.size, memberCount),
          detail: `${submitters.size} dari ${memberCount} staff`,
        },
      ],
    };
  }),

  // Recent organization activity feed — merges real submission/review/
  // pre-assessment events across all members, newest first.
  recentActivity: sponsorProcedure.query(async (opts) => {
    const take = 8;
    const [ucSubs, ucReviews, preAssessments] = await Promise.all([
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: { submitted_at: { not: null } },
        orderBy: { submitted_at: "desc" },
        take,
        select: {
          submitted_at: true,
          use_case: { select: { name: true } },
          member: {
            select: {
              user: { select: { full_name: true } },
              group: { select: { name: true } },
            },
          },
        },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: { reviewed_at: { not: null } },
        orderBy: { reviewed_at: "desc" },
        take,
        select: {
          reviewed_at: true,
          is_accepted: true,
          reviewed_by: { select: { user: { select: { full_name: true } } } },
          use_case: { select: { name: true } },
          member: { select: { group: { select: { name: true } } } },
        },
      }),
      opts.ctx.prisma.ailPreAssessment.findMany({
        orderBy: { created_at: "desc" },
        take,
        select: {
          created_at: true,
          q3_job_role: true,
          member: {
            select: {
              user: { select: { full_name: true } },
              group: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    type Activity = {
      at: Date;
      actor: string;
      action: string;
      meta: string;
    };
    const items: Activity[] = [];

    for (const row of ucSubs) {
      if (!row.submitted_at) continue;
      items.push({
        at: row.submitted_at,
        actor: row.member.user?.full_name ?? "Staff",
        action: "kirim use case",
        meta: [row.member.group?.name, row.use_case?.name]
          .filter(Boolean)
          .join(" · "),
      });
    }
    for (const row of ucReviews) {
      if (!row.reviewed_at) continue;
      items.push({
        at: row.reviewed_at,
        actor: row.reviewed_by?.user?.full_name ?? "Champion",
        action: row.is_accepted ? "terima use case" : "review use case",
        meta: [row.member.group?.name, row.use_case?.name]
          .filter(Boolean)
          .join(" · "),
      });
    }
    for (const row of preAssessments) {
      items.push({
        at: row.created_at,
        actor: row.member.user?.full_name ?? "Staff",
        action: "selesai pre-assessment",
        meta: [row.member.group?.name, row.q3_job_role]
          .filter(Boolean)
          .join(" · "),
      });
    }

    const now = dayjs();
    const relTime = (date: Date): string => {
      const min = now.diff(dayjs(date), "minute");
      if (min < 1) return "baru saja";
      if (min < 60) return `${min} mnt`;
      const hour = Math.floor(min / 60);
      if (hour < 24) return `${hour}j`;
      const day = Math.floor(hour / 24);
      if (day < 7) return `${day}h`;
      return dayjs(date).format("D MMM");
    };

    const activity = items
      .sort((a, b) => dayjs(b.at).valueOf() - dayjs(a.at).valueOf())
      .slice(0, 6)
      .map((item) => ({
        actor: item.actor,
        action: item.action,
        meta: item.meta,
        time: relTime(item.at),
      }));

    return { code: STATUS_OK, message: "Success", activity };
  }),

  weeklyTrends: sponsorProcedure.query(async (opts) => {
    const weekCount = 12;
    const totalMembers = await opts.ctx.prisma.ailMember.count();
    const end = dayjs().endOf("week");
    const start = end.subtract(weekCount - 1, "week").startOf("week");

    const rows = await opts.ctx.prisma.ailUseCaseSubmission.findMany({
      where: {
        submitted_at: {
          not: null,
          gte: start.toDate(),
          lte: end.toDate(),
        },
      },
      select: {
        member_id: true,
        submitted_at: true,
        hours_saved: true,
        hours_without_ai: true,
      },
    });

    const weeks = Array.from({ length: weekCount }).map((_, index) => {
      const weekStart = start.add(index, "week");
      const weekEnd = weekStart.endOf("week");
      const weekRows = rows.filter((row) => {
        const submittedAt = dayjs(row.submitted_at);
        return (
          submittedAt.isAfter(weekStart.subtract(1, "millisecond")) &&
          submittedAt.isBefore(weekEnd.add(1, "millisecond"))
        );
      });
      const activeMembers = new Set(weekRows.map((row) => row.member_id)).size;
      const hoursSaved = weekRows.reduce((sum, row) => {
        if (row.hours_saved === null || row.hours_without_ai === null) {
          return sum;
        }
        const saved = Number(row.hours_without_ai) - Number(row.hours_saved);
        return saved > 0 ? sum + saved : sum;
      }, 0);

      return {
        label: weekStart.format("D MMM"),
        hours_saved: Math.round(hoursSaved * 10) / 10,
        adoption_percent:
          totalMembers === 0
            ? 0
            : Math.round((activeMembers / totalMembers) * 100),
        highlight: index === weekCount - 1,
      };
    });

    return { code: STATUS_OK, message: "Success", weeks };
  }),

  // Proficiency over time — the executive "are people actually getting better?"
  // trend. Reconstructed from each member's level_history ({ level_id,
  // unlocked_at }) so we get the org-average level (0..4) and the cumulative
  // share at Level 1+ at the end of each of the last 12 weeks. No schema change.
  proficiencyTrends: sponsorProcedure.query(async (opts) => {
    const weekCount = 12;
    const end = dayjs().endOf("week");
    const start = end.subtract(weekCount - 1, "week").startOf("week");

    const [levels, members] = await Promise.all([
      opts.ctx.prisma.ailLevel.findMany({
        select: { id: true, level_number: true },
      }),
      opts.ctx.prisma.ailMember.findMany({
        select: {
          created_at: true,
          current_level: { select: { level_number: true } },
          level_history: true,
        },
      }),
    ]);

    const levelNumberById = new Map(
      levels.map((l) => [l.id, l.level_number])
    );

    // Per member: creation time, current level, and dated unlock events.
    const timelines = members.map((m) => {
      const unlocks: { at: number; level: number }[] = [];
      if (Array.isArray(m.level_history)) {
        for (const entry of m.level_history as unknown[]) {
          if (!entry || typeof entry !== "object") continue;
          const row = entry as Record<string, unknown>;
          if (typeof row.unlocked_at !== "string") continue;
          const level =
            typeof row.level_id === "number"
              ? levelNumberById.get(row.level_id) ?? 0
              : 0;
          unlocks.push({ at: dayjs(row.unlocked_at).valueOf(), level });
        }
      }
      return {
        createdAt: dayjs(m.created_at).valueOf(),
        currentLevel: m.current_level?.level_number ?? 0,
        unlocks,
      };
    });

    const weeks = Array.from({ length: weekCount }).map((_, index) => {
      const weekStart = start.add(index, "week");
      const cutoff = weekStart.endOf("week").valueOf();

      let sumLevel = 0;
      let existing = 0;
      let atLeastL1 = 0;

      for (const t of timelines) {
        if (t.createdAt > cutoff) continue; // member didn't exist yet
        existing += 1;
        // Level at cutoff = highest unlock on/before cutoff. When a member has
        // no recorded history (seeded rows), fall back to their current level
        // so the latest point stays consistent with the headline KPI.
        let level = 0;
        if (t.unlocks.length === 0) {
          level = t.currentLevel;
        } else {
          for (const u of t.unlocks) {
            if (u.at <= cutoff && u.level > level) level = u.level;
          }
        }
        sumLevel += level;
        if (level >= 1) atLeastL1 += 1;
      }

      return {
        label: weekStart.format("D MMM"),
        avg_level: existing === 0 ? 0 : Math.round((sumLevel / existing) * 100) / 100,
        level1_plus_percent:
          existing === 0 ? 0 : Math.round((atLeastL1 / existing) * 100),
        highlight: index === weekCount - 1,
      };
    });

    return { code: STATUS_OK, message: "Success", weeks };
  }),

  levelDistribution: sponsorProcedure.query(async (opts) => {
    const weeklyActiveThreshold = dayjs().subtract(7, "day").toDate();
    const levelNumbers = [0, 1, 2, 3];
    const [levels, members, groups] = await Promise.all([
      opts.ctx.prisma.ailLevel.findMany({
        where: { status: "ACTIVE" },
        orderBy: { level_number: "asc" },
        select: { id: true, level_number: true, name: true },
      }),
      opts.ctx.prisma.ailMember.findMany({
        select: { current_level_id: true, last_active_at: true },
      }),
      opts.ctx.prisma.ailGroup.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          members: {
            select: {
              current_level_id: true,
              last_active_at: true,
            },
          },
        },
      }),
    ]);
    const levelByNumber = new Map(levels.map((level) => [level.level_number, level]));
    const displayLevels = levelNumbers.map((levelNumber) => {
      const level = levelByNumber.get(levelNumber);
      return {
        id: level?.id ?? -levelNumber - 1,
        level_number: levelNumber,
        name: level?.name ?? `Level ${levelNumber}`,
      };
    });

    const total = members.length;
    const activeWeekly = members.filter(
      (member) =>
        member.last_active_at && member.last_active_at >= weeklyActiveThreshold
    ).length;
    const countByLevel = new Map<number, number>();
    for (const member of members) {
      countByLevel.set(
        member.current_level_id,
        (countByLevel.get(member.current_level_id) ?? 0) + 1
      );
    }

    const levelsDistribution = displayLevels.map((level) => {
      const count = countByLevel.get(level.id) ?? 0;
      return {
        id: level.id,
        code: `L${level.level_number}`,
        label: `Level ${level.level_number}`,
        name: level.name,
        count,
        percent: total === 0 ? 0 : Math.round((count / total) * 100),
      };
    });
    const entryLevelIds = new Set(
      displayLevels
        .filter((level) => level.level_number <= 1)
        .map((level) => level.id)
    );
    const groupsDistribution = groups
      .map((group) => {
        const groupTotal = group.members.length;
        const groupCounts = displayLevels.map((level) => {
          const count = group.members.filter(
            (member) => member.current_level_id === level.id
          ).length;
          return {
            level_id: level.id,
            code: `L${level.level_number}`,
            label: `Level ${level.level_number}`,
            name: level.name,
            count,
            percent:
              groupTotal === 0 ? 0 : Math.round((count / groupTotal) * 100),
          };
        });
        const beginnerCount = group.members.filter((member) =>
          entryLevelIds.has(member.current_level_id)
        ).length;

        return {
          id: group.id,
          name: group.name,
          total: groupTotal,
          active_weekly: group.members.filter(
            (member) =>
              member.last_active_at &&
              member.last_active_at >= weeklyActiveThreshold
          ).length,
          entry_level_count: beginnerCount,
          entry_level_percent:
            groupTotal === 0
              ? 0
              : Math.round((beginnerCount / groupTotal) * 100),
          levels: groupCounts,
        };
      })
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

    const groupsNeedingIntervention = groupsDistribution
      .filter((group) => group.total > 0 && group.entry_level_percent >= 35)
      .sort(
        (a, b) =>
          b.entry_level_percent - a.entry_level_percent || b.total - a.total
      );

    return {
      code: STATUS_OK,
      message: "Success",
      total,
      active_weekly: activeWeekly,
      participation_percent:
        total === 0 ? 0 : Math.round((activeWeekly / total) * 100),
      levels: levelsDistribution,
      groups: groupsDistribution,
      groups_needing_intervention: groupsNeedingIntervention,
    };
  }),

  // Per-department performance for the sponsor "Kinerja per Departemen" table:
  // member count, average competency level, top submitted use case, total
  // submissions (use case + prompt), cumulative hours saved, and a
  // week-over-week hours-saved trend. All derived from real submission data.
  organizationLeaderboard: sponsorProcedure.query(async (opts) => {
    const now = dayjs();
    const weekAgo = now.subtract(7, "day");
    const twoWeeksAgo = now.subtract(14, "day");

    const [groups, levels, useCaseSubs, promptSubs] = await Promise.all([
      opts.ctx.prisma.ailGroup.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          members: {
            select: { current_level: { select: { level_number: true } } },
          },
        },
      }),
      opts.ctx.prisma.ailLevel.findMany({
        where: { status: "ACTIVE" },
        select: { level_number: true },
      }),
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: { submitted_at: { not: null } },
        select: {
          hours_saved: true,
          hours_without_ai: true,
          submitted_at: true,
          use_case: { select: { name: true } },
          member: { select: { group_id: true } },
        },
      }),
      opts.ctx.prisma.ailPromptSubmission.findMany({
        where: { submitted_at: { not: null } },
        select: { member: { select: { group_id: true } } },
      }),
    ]);

    const maxScore = Math.max(...levels.map((l) => l.level_number), 3);

    type GroupAcc = {
      hoursTotal: number;
      hoursThisWeek: number;
      hoursPrevWeek: number;
      submissionCount: number;
      useCaseCounts: Map<string, number>;
    };
    const acc = new Map<number, GroupAcc>();
    const ensure = (groupId: number): GroupAcc => {
      let a = acc.get(groupId);
      if (!a) {
        a = {
          hoursTotal: 0,
          hoursThisWeek: 0,
          hoursPrevWeek: 0,
          submissionCount: 0,
          useCaseCounts: new Map(),
        };
        acc.set(groupId, a);
      }
      return a;
    };

    for (const sub of useCaseSubs) {
      const groupId = sub.member.group_id;
      if (groupId == null) continue;
      const a = ensure(groupId);
      a.submissionCount += 1;
      const name = sub.use_case?.name;
      if (name) a.useCaseCounts.set(name, (a.useCaseCounts.get(name) ?? 0) + 1);
      if (sub.hours_saved === null || sub.hours_without_ai === null) continue;
      const saved = Number(sub.hours_without_ai) - Number(sub.hours_saved);
      if (saved <= 0) continue;
      a.hoursTotal += saved;
      const at = dayjs(sub.submitted_at);
      if (at.isAfter(weekAgo)) a.hoursThisWeek += saved;
      else if (at.isAfter(twoWeeksAgo)) a.hoursPrevWeek += saved;
    }
    for (const sub of promptSubs) {
      const groupId = sub.member.group_id;
      if (groupId == null) continue;
      ensure(groupId).submissionCount += 1;
    }

    const list = groups
      .map((group) => {
        const a = acc.get(group.id);
        const memberCount = group.members.length;
        const avgScore =
          memberCount === 0
            ? 0
            : group.members.reduce(
                (sum, m) => sum + (m.current_level?.level_number ?? 0),
                0
              ) / memberCount;

        let topUseCase: string | null = null;
        if (a && a.useCaseCounts.size > 0) {
          let best = -1;
          for (const [name, count] of a.useCaseCounts) {
            if (count > best) {
              best = count;
              topUseCase = name;
            }
          }
        }

        const hoursThisWeek = a?.hoursThisWeek ?? 0;
        const hoursPrevWeek = a?.hoursPrevWeek ?? 0;
        const trendPercent =
          hoursPrevWeek > 0
            ? Math.round(((hoursThisWeek - hoursPrevWeek) / hoursPrevWeek) * 100)
            : null;

        return {
          id: group.id,
          name: group.name,
          member_count: memberCount,
          avg_score: Math.round(avgScore * 10) / 10,
          top_use_case: topUseCase,
          submission_count: a?.submissionCount ?? 0,
          hours: Math.round((a?.hoursTotal ?? 0) * 10) / 10,
          trend_percent: trendPercent,
        };
      })
      .sort((a, b) => b.avg_score - a.avg_score || a.name.localeCompare(b.name))
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return { code: STATUS_OK, message: "Success", max_score: maxScore, list };
  }),

  memberDetail: championProcedure
    .input(z.object({ member_id: z.number().int().positive() }))
    .query(async (opts) => {
      const championId = opts.ctx.ail_member.id;
      const { member_id } = opts.input;

      const member = await opts.ctx.prisma.ailMember.findUnique({
        where: { id: member_id },
        include: {
          user: {
            select: { id: true, full_name: true, email: true, avatar: true },
          },
          group: { select: { id: true, name: true, champion_id: true } },
          current_level: true,
        },
      });

      if (!member || member.group?.champion_id !== championId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only access members in groups you lead.",
        });
      }

      const currentLevelNumber = member.current_level.level_number;
      const [
        levels,
        quizSubs,
        promptSubs,
        useCaseSubs,
        videoComps,
        materialComps,
        currentLevelChapters,
      ] = await Promise.all([
        opts.ctx.prisma.ailLevel.findMany({
          where: { status: "ACTIVE" },
          orderBy: { level_number: "asc" },
        }),
        opts.ctx.prisma.ailQuizSubmission.findMany({
          where: { member_id, is_completed: true },
          orderBy: { submitted_at: "desc" },
          include: {
            quiz: {
              select: {
                id: true,
                name: true,
                chapter: {
                  select: {
                    id: true,
                    name: true,
                    level: { select: { level_number: true, name: true } },
                  },
                },
              },
            },
          },
        }),
        opts.ctx.prisma.ailPromptSubmission.findMany({
          where: { member_id, assigned_by_id: championId },
          orderBy: [{ submitted_at: "desc" }, { created_at: "desc" }],
          include: {
            prompt: {
              select: {
                id: true,
                name: true,
                level: { select: { level_number: true, name: true } },
              },
            },
          },
        }),
        opts.ctx.prisma.ailUseCaseSubmission.findMany({
          where: { member_id, assigned_by_id: championId },
          orderBy: [{ submitted_at: "desc" }, { created_at: "desc" }],
          include: {
            use_case: {
              select: {
                id: true,
                name: true,
                level: { select: { level_number: true, name: true } },
              },
            },
          },
        }),
        opts.ctx.prisma.ailVideoCompletion.findMany({
          where: { member_id },
          select: { video_id: true, completed_at: true },
        }),
        opts.ctx.prisma.ailMaterialCompletion.findMany({
          where: { member_id },
          select: { material_id: true, completed_at: true },
        }),
        opts.ctx.prisma.ailChapter.findMany({
          where: {
            status: "ACTIVE",
            level: { level_number: currentLevelNumber },
          },
          select: {
            quizzes: { where: { status: "ACTIVE" }, select: { id: true } },
            materials: { where: { status: "ACTIVE" }, select: { id: true } },
          },
        }),
      ]);

      const nextLevel =
        levels.find((level) => level.level_number === currentLevelNumber + 1) ??
        null;
      const currentRequiredQuizIds = currentLevelChapters.flatMap((chapter) =>
        chapter.quizzes.map((quiz) => quiz.id)
      );
      const currentRequiredMaterialIds = currentLevelChapters.flatMap(
        (chapter) => chapter.materials.map((material) => material.id)
      );
      const completedQuizIds = new Set(quizSubs.map((submission) => submission.quiz_id));
      const completedMaterialIds = new Set(
        materialComps.map((completion) => completion.material_id)
      );
      const gateDone =
        currentRequiredQuizIds.filter((id) => completedQuizIds.has(id)).length +
        currentRequiredMaterialIds.filter((id) => completedMaterialIds.has(id))
          .length;
      const gateTotal =
        currentRequiredQuizIds.length + currentRequiredMaterialIds.length;
      const gatePercent = gateTotal === 0 ? 100 : Math.round((gateDone / gateTotal) * 100);

      const bestQuizByQuiz = new Map<string, number>();
      for (const submission of quizSubs) {
        const prev = bestQuizByQuiz.get(submission.quiz_id);
        if (prev === undefined || submission.score > prev) {
          bestQuizByQuiz.set(submission.quiz_id, submission.score);
        }
      }
      const avgQuiz =
        bestQuizByQuiz.size === 0
          ? 0
          : Math.round(
              Array.from(bestQuizByQuiz.values()).reduce((a, b) => a + b, 0) /
                bestQuizByQuiz.size
            );

      const activityDays = [
        ...quizSubs.map((submission) => submission.submitted_at),
        ...videoComps.map((completion) => completion.completed_at),
        ...materialComps.map((completion) => completion.completed_at),
      ].map((date) => dayjs(date).startOf("day").format("YYYY-MM-DD"));
      const activeDaySet = new Set(activityDays);
      let streak = 0;
      let cursor = dayjs().startOf("day");
      if (!activeDaySet.has(cursor.format("YYYY-MM-DD"))) {
        cursor = cursor.subtract(1, "day");
      }
      while (activeDaySet.has(cursor.format("YYYY-MM-DD"))) {
        streak += 1;
        cursor = cursor.subtract(1, "day");
      }

      const promptAccepted = promptSubs.filter((submission) => submission.is_accepted).length;
      const useCaseAccepted = useCaseSubs.filter((submission) => submission.is_accepted).length;
      const submittedPrompts = promptSubs.filter((submission) => submission.submitted_at);
      const submittedUseCases = useCaseSubs.filter((submission) => submission.submitted_at);
      const uniqueTools = new Set<string>();
      for (const submission of submittedUseCases) {
        if (!submission.ai_tool) continue;
        for (const raw of submission.ai_tool.split(",")) {
          const tool = raw.trim().toLowerCase();
          if (tool) uniqueTools.add(tool);
        }
      }

      const clamp = (n: number, min = 0, max = 5) =>
        Math.max(min, Math.min(max, n));
      const dimensions = [
        {
          key: "specificity",
          label: "Specificity",
          score: clamp(avgQuiz / 20),
        },
        {
          key: "context",
          label: "Context",
          score:
            submittedPrompts.length === 0
              ? 0
              : clamp((promptAccepted / submittedPrompts.length) * 5),
        },
        {
          key: "verification",
          label: "Verification",
          score:
            submittedUseCases.length === 0
              ? 0
              : clamp((useCaseAccepted / submittedUseCases.length) * 5),
        },
        {
          key: "iteration",
          label: "Iteration",
          score: clamp(submittedPrompts.length / 2),
        },
        {
          key: "workflow",
          label: "Workflow",
          score: clamp(submittedUseCases.length),
        },
        {
          key: "tool",
          label: "Tool",
          score: clamp(uniqueTools.size),
        },
      ].map((dimension) => ({
        ...dimension,
        score: Math.round(dimension.score * 10) / 10,
      }));

      const activities = [
        ...useCaseSubs.map((submission) => ({
          id: `use-case-${submission.id}`,
          type: "use_case" as const,
          title: `Use case: ${submission.use_case.name}`,
          subtitle: submission.is_accepted
            ? "Diterima"
            : submission.submitted_at
              ? "Submitted - menunggu review"
              : "Belum submit",
          status: submission.is_accepted
            ? "accepted"
            : submission.submitted_at
              ? "submitted"
              : "assigned",
          occurred_at: submission.reviewed_at ?? submission.submitted_at ?? submission.created_at,
        })),
        ...promptSubs.map((submission) => ({
          id: `prompt-${submission.id}`,
          type: "prompt" as const,
          title: `Prompt: ${submission.prompt.name}`,
          subtitle: submission.is_accepted
            ? "Diterima"
            : submission.submitted_at
              ? "Submitted - menunggu review"
              : "Belum submit",
          status: submission.is_accepted
            ? "accepted"
            : submission.submitted_at
              ? "submitted"
              : "assigned",
          occurred_at: submission.reviewed_at ?? submission.submitted_at ?? submission.created_at,
        })),
        ...quizSubs.slice(0, 8).map((submission) => ({
          id: `quiz-${submission.id}`,
          type: "quiz" as const,
          title: `Quiz: ${submission.quiz.name}`,
          subtitle: `Lulus - skor ${submission.score}/100`,
          status: "accepted",
          occurred_at: submission.submitted_at,
        })),
      ]
        .sort(
          (a, b) =>
            dayjs(b.occurred_at).valueOf() - dayjs(a.occurred_at).valueOf()
        )
        .slice(0, 8);

      const coachingNotes = await opts.ctx.prisma.ailCoachingNote.findMany({
        where: { member_id },
        orderBy: { created_at: "desc" },
        take: 20,
        include: { champion: { select: { user: { select: { full_name: true } } } } },
      });
      const notes = coachingNotes.map((n) => ({
        id: n.id,
        text: n.text,
        created_at: n.created_at,
        champion_name: n.champion.user.full_name,
      }));

      return {
        code: STATUS_OK,
        message: "Success",
        member: {
          id: member.id,
          full_name: member.user.full_name,
          email: member.user.email,
          avatar: member.user.avatar,
          job_title: member.job_title,
          group: member.group ? { id: member.group.id, name: member.group.name } : null,
          current_level: {
            id: member.current_level.id,
            level_number: member.current_level.level_number,
            name: member.current_level.name,
            icon: member.current_level.icon,
          },
          joined_at: member.created_at,
          last_active_at: member.last_active_at,
        },
        metrics: {
          gate_percent: gatePercent,
          streak_days: streak,
          submission_total: submittedPrompts.length + submittedUseCases.length,
          avg_quiz: avgQuiz,
        },
        radar: {
          total_submissions: submittedPrompts.length + submittedUseCases.length,
          dimensions,
        },
        gate: {
          from_level: currentLevelNumber,
          to_level: nextLevel?.level_number ?? currentLevelNumber,
          next_level_id: nextLevel?.id ?? null,
          done: gateDone,
          total: gateTotal,
          percent: gatePercent,
          ready: gatePercent >= 100,
          requirements: [
            {
              label: `${gateDone} / ${gateTotal} modul level ${currentLevelNumber} selesai`,
              completed: gateTotal > 0 && gateDone >= gateTotal,
            },
            {
              label: avgQuiz > 0 ? `Avg quiz ${avgQuiz}/100` : "Avg quiz belum ada",
              completed: avgQuiz >= 80,
            },
            {
              label: `${useCaseAccepted} use case diterima`,
              completed: useCaseAccepted > 0,
            },
            {
              label: `${promptAccepted} prompt diterima`,
              completed: promptAccepted > 0,
            },
          ],
        },
        activities,
        notes,
      };
    }),

  achievements: ailMemberProcedure.query(async (opts) => {
    const memberId = opts.ctx.ail_member.id;

    const [ucAllTime, prCount] = await Promise.all([
      opts.ctx.prisma.ailUseCaseSubmission.findMany({
        where: { member_id: memberId, submitted_at: { not: null } },
        select: {
          hours_saved: true,
          hours_without_ai: true,
          ai_tool: true,
        },
      }),
      opts.ctx.prisma.ailPromptSubmission.count({
        where: { member_id: memberId, submitted_at: { not: null } },
      }),
    ]);

    let hours_saved_total = 0;
    for (const uc of ucAllTime) {
      if (uc.hours_saved !== null && uc.hours_without_ai !== null) {
        const saved = Number(uc.hours_without_ai) - Number(uc.hours_saved);
        if (saved > 0) hours_saved_total += saved;
      }
    }

    // Case-insensitive dedup, preserve first-seen casing
    const toolsSeen = new Map<string, string>();
    for (const uc of ucAllTime) {
      if (!uc.ai_tool) continue;
      for (const raw of uc.ai_tool.split(",")) {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!toolsSeen.has(key)) toolsSeen.set(key, trimmed);
      }
    }

    return {
      code: STATUS_OK,
      message: "Success",
      use_case_count: ucAllTime.length,
      prompt_count: prCount,
      hours_saved_total: Math.round(hours_saved_total * 10) / 10,
      tools_mastered: Array.from(toolsSeen.values()),
    };
  }),

  streak: ailMemberProcedure
    .input(
      z
        .object({
          from: z.iso.date().optional(),
          to: z.iso.date().optional(),
        })
        .optional()
    )
    .query(async (opts) => {
      const memberId = opts.ctx.ail_member.id;
      const today = dayjs().startOf("day");
      const to = opts.input?.to ? dayjs(opts.input.to).startOf("day") : today;
      // Default range: last 90 days (~3 months) ending at `to`.
      const from = opts.input?.from
        ? dayjs(opts.input.from).startOf("day")
        : to.subtract(89, "day");

      // We also need a couple extra days back to compute consecutive streak
      // when the requested range starts after recent activity.
      const streakLookback = today.subtract(60, "day");
      const earliestFetch = (
        from.isBefore(streakLookback) ? from : streakLookback
      ).toDate();

      const [quizSubs, videoComps, materialComps] = await Promise.all([
        opts.ctx.prisma.ailQuizSubmission.findMany({
          where: {
            member_id: memberId,
            is_completed: true,
            submitted_at: { gte: earliestFetch },
          },
          select: { submitted_at: true },
        }),
        opts.ctx.prisma.ailVideoCompletion.findMany({
          where: {
            member_id: memberId,
            completed_at: { gte: earliestFetch },
          },
          select: { completed_at: true },
        }),
        opts.ctx.prisma.ailMaterialCompletion.findMany({
          where: {
            member_id: memberId,
            completed_at: { gte: earliestFetch },
          },
          select: { completed_at: true },
        }),
      ]);

      const completionDays = [
        ...quizSubs.map((s) => dayjs(s.submitted_at).startOf("day")),
        ...videoComps.map((v) => dayjs(v.completed_at).startOf("day")),
        ...materialComps.map((m) => dayjs(m.completed_at).startOf("day")),
      ];

      const countByDay = new Map<string, number>();
      for (const d of completionDays) {
        const k = d.format("YYYY-MM-DD");
        countByDay.set(k, (countByDay.get(k) ?? 0) + 1);
      }

      const totalDays = to.diff(from, "day") + 1;
      const days: { date: string; count: number }[] = [];
      for (let i = 0; i < totalDays; i++) {
        const day = from.add(i, "day");
        const k = day.format("YYYY-MM-DD");
        days.push({ date: k, count: countByDay.get(k) ?? 0 });
      }

      // Consecutive streak ending today (or yesterday if today is still empty)
      let current_streak = 0;
      let cursor = today;
      if ((countByDay.get(cursor.format("YYYY-MM-DD")) ?? 0) === 0) {
        cursor = cursor.subtract(1, "day");
      }
      while ((countByDay.get(cursor.format("YYYY-MM-DD")) ?? 0) > 0) {
        current_streak += 1;
        cursor = cursor.subtract(1, "day");
      }

      return {
        code: STATUS_OK,
        message: "Success",
        from: from.format("YYYY-MM-DD"),
        to: to.format("YYYY-MM-DD"),
        days,
        current_streak,
      };
    }),

  groupLeaderboard: ailMemberProcedure.query(async (opts) => {
    const memberId = opts.ctx.ail_member.id;
    const groupId = opts.ctx.ail_member.group_id;

    if (!groupId) {
      return {
        code: STATUS_OK,
        message: "Success",
        group: null,
        my_rank: 0,
        total: 0,
        leaderboard: [],
      };
    }

    const group = await opts.ctx.prisma.ailGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: { select: { id: true, full_name: true, avatar: true } },
          },
        },
      },
    });

    if (!group) {
      return {
        code: STATUS_OK,
        message: "Success",
        group: null,
        my_rank: 0,
        total: 0,
        leaderboard: [],
      };
    }

    const memberIds = group.members.map((m) => m.id);
    const xpAgg = await opts.ctx.prisma.ailXpEarning.groupBy({
      by: ["member_id"],
      _sum: { xp_earned: true },
      where: { member_id: { in: memberIds } },
    });
    const xpByMember = new Map<number, number>(
      xpAgg.map((x) => [x.member_id, x._sum.xp_earned ?? 0])
    );

    const leaderboard = group.members
      .map((m) => ({
        member_id: m.id,
        full_name: m.user.full_name,
        avatar: m.user.avatar,
        total_xp: xpByMember.get(m.id) ?? 0,
        is_me: m.id === memberId,
      }))
      .sort((a, b) => b.total_xp - a.total_xp)
      .map((r, i) => ({ rank: i + 1, ...r }));

    const myEntry = leaderboard.find((r) => r.is_me);

    return {
      code: STATUS_OK,
      message: "Success",
      group: { id: group.id, name: group.name },
      my_rank: myEntry?.rank ?? leaderboard.length,
      total: leaderboard.length,
      leaderboard,
    };
  }),

  promptAssignment: ailMemberProcedure
    .input(z.object({ prompt_id: z.number().int().positive() }))
    .query(async (opts) => {
      const member = opts.ctx.ail_member;
      const memberId = member.id;
      const { prompt_id } = opts.input;

      let row = await opts.ctx.prisma.ailPromptSubmission.findUnique({
        where: {
          member_id_prompt_id: { member_id: memberId, prompt_id },
        },
        include: promptAssignmentInclude,
      });

      if (!row) {
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

        const championId = await resolveMemberChampion(
          opts.ctx.prisma,
          member.group_id
        );
        row = await opts.ctx.prisma.ailPromptSubmission.create({
          data: {
            member_id: memberId,
            prompt_id,
            assigned_by_id: championId,
          },
          include: promptAssignmentInclude,
        });
      } else if (!row.assigned_by_id) {
        const championId = await resolveMemberChampion(
          opts.ctx.prisma,
          member.group_id
        );
        row = await opts.ctx.prisma.ailPromptSubmission.update({
          where: { id: row.id },
          data: { assigned_by_id: championId },
          include: promptAssignmentInclude,
        });
      }

      return {
        code: STATUS_OK,
        message: "Success",
        assignment: {
          id: row.id,
          prompt: {
            id: row.prompt.id,
            name: row.prompt.name,
            scenario: row.prompt.scenario,
            expected_output: row.prompt.expected_output,
            level: row.prompt.level,
            categories: row.prompt.categories.map((c) => c.category),
          },
          assigned_by: row.assigned_by
            ? {
                id: row.assigned_by.id,
                full_name: row.assigned_by.user.full_name,
                avatar: row.assigned_by.user.avatar,
              }
            : null,
          reviewed_by: row.reviewed_by
            ? {
                id: row.reviewed_by.id,
                full_name: row.reviewed_by.user.full_name,
                avatar: row.reviewed_by.user.avatar,
              }
            : null,
          deadline: row.deadline,
          message: row.message,
          input: row.input,
          output: row.output,
          submitted_at: row.submitted_at,
          reviewed_at: row.reviewed_at,
          comment: row.comment,
          is_accepted: row.is_accepted,
        },
      };
    }),

  useCaseAssignment: ailMemberProcedure
    .input(z.object({ use_case_id: z.number().int().positive() }))
    .query(async (opts) => {
      const member = opts.ctx.ail_member;
      const memberId = member.id;
      const { use_case_id } = opts.input;

      let row = await opts.ctx.prisma.ailUseCaseSubmission.findUnique({
        where: {
          member_id_use_case_id: { member_id: memberId, use_case_id },
        },
        include: useCaseAssignmentInclude,
      });

      if (!row) {
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

        const championId = await resolveMemberChampion(
          opts.ctx.prisma,
          member.group_id
        );
        row = await opts.ctx.prisma.ailUseCaseSubmission.create({
          data: {
            member_id: memberId,
            use_case_id,
            assigned_by_id: championId,
          },
          include: useCaseAssignmentInclude,
        });
      } else if (!row.assigned_by_id) {
        const championId = await resolveMemberChampion(
          opts.ctx.prisma,
          member.group_id
        );
        row = await opts.ctx.prisma.ailUseCaseSubmission.update({
          where: { id: row.id },
          data: { assigned_by_id: championId },
          include: useCaseAssignmentInclude,
        });
      }

      return {
        code: STATUS_OK,
        message: "Success",
        assignment: {
          id: row.id,
          use_case: {
            id: row.use_case.id,
            name: row.use_case.name,
            description: row.use_case.description,
            level: row.use_case.level,
            categories: row.use_case.categories.map((c) => c.category),
          },
          assigned_by: row.assigned_by
            ? {
                id: row.assigned_by.id,
                full_name: row.assigned_by.user.full_name,
                avatar: row.assigned_by.user.avatar,
              }
            : null,
          reviewed_by: row.reviewed_by
            ? {
                id: row.reviewed_by.id,
                full_name: row.reviewed_by.user.full_name,
                avatar: row.reviewed_by.user.avatar,
              }
            : null,
          deadline: row.deadline,
          message: row.message,
          outcome_proof: row.outcome_proof,
          hours_saved: row.hours_saved,
          hours_without_ai: row.hours_without_ai,
          description: row.description,
          ai_tool: row.ai_tool,
          frequency: row.frequency,
          type: row.type,
          submitted_at: row.submitted_at,
          reviewed_at: row.reviewed_at,
          comment: row.comment,
          is_accepted: row.is_accepted,
        },
      };
    }),

  promptSubmissionDetail: championProcedure
    .input(z.object({ submission_id: z.number().int().positive() }))
    .query(async (opts) => {
      const championId = opts.ctx.ail_member.id;
      const { submission_id } = opts.input;

      const row = await opts.ctx.prisma.ailPromptSubmission.findUnique({
        where: { id: submission_id },
        include: {
          prompt: {
            include: {
              level: {
                select: { id: true, level_number: true, name: true },
              },
              categories: {
                include: { category: { select: { id: true, name: true } } },
              },
            },
          },
          member: {
            select: {
              id: true,
              user: { select: { full_name: true, avatar: true, email: true } },
            },
          },
          reviewed_by: {
            select: {
              id: true,
              user: { select: { full_name: true, avatar: true } },
            },
          },
        },
      });

      if (!row || row.assigned_by_id !== championId) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Submission not found.",
        });
      }

      return {
        code: STATUS_OK,
        message: "Success",
        submission: {
          id: row.id,
          prompt: {
            id: row.prompt.id,
            name: row.prompt.name,
            scenario: row.prompt.scenario,
            expected_output: row.prompt.expected_output,
            level: row.prompt.level,
            categories: row.prompt.categories.map((c) => c.category),
          },
          member: {
            id: row.member.id,
            full_name: row.member.user.full_name,
            email: row.member.user.email,
            avatar: row.member.user.avatar,
          },
          reviewed_by: row.reviewed_by
            ? {
                id: row.reviewed_by.id,
                full_name: row.reviewed_by.user.full_name,
                avatar: row.reviewed_by.user.avatar,
              }
            : null,
          deadline: row.deadline,
          message: row.message,
          input: row.input,
          output: row.output,
          submitted_at: row.submitted_at,
          reviewed_at: row.reviewed_at,
          comment: row.comment,
          is_accepted: row.is_accepted,
          rubric_specificity: row.rubric_specificity,
          rubric_context: row.rubric_context,
          rubric_constraints: row.rubric_constraints,
          rubric_examples: row.rubric_examples,
          rubric_iteration: row.rubric_iteration,
        },
      };
    }),

  useCaseSubmissionDetail: championProcedure
    .input(z.object({ submission_id: z.number().int().positive() }))
    .query(async (opts) => {
      const championId = opts.ctx.ail_member.id;
      const { submission_id } = opts.input;

      const row = await opts.ctx.prisma.ailUseCaseSubmission.findUnique({
        where: { id: submission_id },
        include: {
          use_case: {
            include: {
              level: {
                select: { id: true, level_number: true, name: true },
              },
              categories: {
                include: { category: { select: { id: true, name: true } } },
              },
            },
          },
          member: {
            select: {
              id: true,
              user: { select: { full_name: true, avatar: true, email: true } },
            },
          },
          reviewed_by: {
            select: {
              id: true,
              user: { select: { full_name: true, avatar: true } },
            },
          },
        },
      });

      if (!row || row.assigned_by_id !== championId) {
        throw new TRPCError({
          code: STATUS_NOT_FOUND,
          message: "Submission not found.",
        });
      }

      return {
        code: STATUS_OK,
        message: "Success",
        submission: {
          id: row.id,
          use_case: {
            id: row.use_case.id,
            name: row.use_case.name,
            description: row.use_case.description,
            level: row.use_case.level,
            categories: row.use_case.categories.map((c) => c.category),
          },
          member: {
            id: row.member.id,
            full_name: row.member.user.full_name,
            email: row.member.user.email,
            avatar: row.member.user.avatar,
          },
          reviewed_by: row.reviewed_by
            ? {
                id: row.reviewed_by.id,
                full_name: row.reviewed_by.user.full_name,
                avatar: row.reviewed_by.user.avatar,
              }
            : null,
          deadline: row.deadline,
          message: row.message,
          outcome_proof: row.outcome_proof,
          hours_saved: row.hours_saved,
          hours_without_ai: row.hours_without_ai,
          description: row.description,
          ai_tool: row.ai_tool,
          frequency: row.frequency,
          type: row.type,
          submitted_at: row.submitted_at,
          reviewed_at: row.reviewed_at,
          comment: row.comment,
          is_accepted: row.is_accepted,
        },
      };
    }),
});
