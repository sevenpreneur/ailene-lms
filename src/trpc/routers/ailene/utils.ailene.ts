import GetPrismaClient from "@/lib/prisma";
import GetQStashClient from "@/lib/qstash";
import { z } from "zod";

export const chapterProgressEnum = z.enum([
  "not_started",
  "in_progress",
  "completed",
]);
export type ChapterProgress = z.infer<typeof chapterProgressEnum>;

export const QUIZ_DURATION_SECONDS = 20 * 60;

type PrismaClient = ReturnType<typeof GetPrismaClient>;

export function getQuizSecondsLeft(startedAt: Date): number {
  const elapsed = (Date.now() - startedAt.getTime()) / 1000;
  return Math.max(0, Math.ceil(QUIZ_DURATION_SECONDS - elapsed));
}

export async function finalizeQuizSubmission(
  prisma: PrismaClient,
  submissionId: number,
  overrideAnswers?: Record<string, string | null>
): Promise<{
  score: number;
  xp_awarded: number;
  already_completed: boolean;
}> {
  const submission = await prisma.ailQuizSubmission.findUnique({
    where: { id: submissionId },
    include: {
      quiz: {
        include: { questions: { include: { options: true } } },
      },
    },
  });
  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }
  if (submission.is_completed) {
    return {
      score: submission.score,
      xp_awarded: 0,
      already_completed: true,
    };
  }

  const answers: Record<string, string | null> =
    overrideAnswers ??
    (submission.answers as Record<string, string | null> | null) ??
    {};

  let correct = 0;
  let xpFromCorrect = 0;
  for (const q of submission.quiz.questions) {
    const sel = answers[String(q.id)];
    const corr = q.options.find((o) => o.is_correct);
    if (corr && sel === corr.option_code) {
      correct += 1;
      xpFromCorrect += q.xp_reward;
    }
  }
  const score =
    submission.quiz.questions.length > 0
      ? Math.round((correct / submission.quiz.questions.length) * 100)
      : 0;

  await prisma.ailQuizSubmission.update({
    where: { id: submissionId },
    data: {
      answers,
      score,
      is_completed: true,
      submitted_at: new Date(),
    },
  });

  const existingXp = await prisma.ailXpEarning.findUnique({
    where: {
      member_id_learning_type_learning_id: {
        member_id: submission.member_id,
        learning_type: "QUIZ",
        learning_id: submission.quiz_id,
      },
    },
  });
  const previousXp = existingXp?.xp_earned ?? 0;
  const finalXp = Math.max(previousXp, xpFromCorrect);
  let xp_awarded = 0;
  if (!existingXp || finalXp > previousXp) {
    await prisma.ailXpEarning.upsert({
      where: {
        member_id_learning_type_learning_id: {
          member_id: submission.member_id,
          learning_type: "QUIZ",
          learning_id: submission.quiz_id,
        },
      },
      create: {
        member_id: submission.member_id,
        learning_type: "QUIZ",
        learning_id: submission.quiz_id,
        xp_earned: finalXp,
      },
      update: { xp_earned: finalXp, earned_at: new Date() },
    });
    xp_awarded = finalXp - previousXp;
  }

  return { score, xp_awarded, already_completed: false };
}

// Host QStash should deliver jobs back to. In local dev the message must loop
// through the ngrok tunnel to reach this machine; in prod it's the api
// subdomain. NGROK_DOMAIN may include a scheme/trailing slash, so normalise to
// a bare host (the host-header match in next.config expects no scheme either).
function qstashTargetDomain(): string {
  if (process.env.DOMAIN_MODE === "local" && process.env.NGROK_DOMAIN) {
    return process.env.NGROK_DOMAIN.replace(/^https?:\/\//, "").replace(
      /\/+$/,
      ""
    );
  }
  return "api.sevenpreneur.net";
}

export async function scheduleQuizAutoSubmit(
  submissionId: number,
  delaySeconds: number
): Promise<void> {
  try {
    const qstash = GetQStashClient();
    const res = await qstash.publishJSON({
      url: `https://${qstashTargetDomain()}/qstash/auto-submit-quiz`,
      body: { submission_id: submissionId },
      delay: delaySeconds,
    });
    console.log(
      `[qstash] auto-submit-quiz scheduled: submission=${submissionId} delay=${delaySeconds}s messageId=${res.messageId}`
    );
  } catch (err) {
    console.error(
      `[qstash] auto-submit-quiz publish FAILED: submission=${submissionId}`,
      err
    );
    throw err;
  }
}

// Fire off the background job that asks OpenAI to write the pre-assessment
// report recommendations. Best-effort: the report row already exists in
// "pending", so a publish failure just leaves it pending for a manual retry.
export async function schedulePreAssessmentReport(
  preAssessmentId: number
): Promise<void> {
  try {
    const qstash = GetQStashClient();
    const res = await qstash.publishJSON({
      url: `https://${qstashTargetDomain()}/qstash/generate-pre-assessment-report`,
      body: { pre_assessment_id: preAssessmentId },
    });
    console.log(
      `[qstash] generate-pre-assessment-report scheduled: pre_assessment=${preAssessmentId} messageId=${res.messageId}`
    );
  } catch (err) {
    console.error(
      `[qstash] generate-pre-assessment-report publish FAILED: pre_assessment=${preAssessmentId}`,
      err
    );
    throw err;
  }
}
