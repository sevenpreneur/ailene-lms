import GetQStashClient from "@/lib/qstash";

// Resolve the public worker host.
function qstashTargetDomain(): string {
  if (process.env.DOMAIN_MODE === "local" && process.env.NGROK_DOMAIN) {
    return process.env.NGROK_DOMAIN.replace(/^https?:\/\//, "").replace(
      /\/+$/,
      ""
    );
  }
  return "gateway.ailene.id";
}

export async function scheduleQuizAutoSubmit(
  submissionId: number,
  delaySeconds: number
): Promise<void> {
  try {
    const qstash = GetQStashClient();
    const res = await qstash.publishJSON({
      url: `https://${qstashTargetDomain()}/qstash/submit-quiz`,
      body: { submission_id: submissionId },
      delay: delaySeconds,
    });
    console.log(
      `[qstash] submit-quiz scheduled: submission=${submissionId} delay=${delaySeconds}s messageId=${res.messageId}`
    );
  } catch (err) {
    console.error(
      `[qstash] submit-quiz publish FAILED: submission=${submissionId}`,
      err
    );
    throw err;
  }
}

// Queue pre-assessment report generation.
export async function schedulePreAssessmentReport(
  preAssessmentId: number
): Promise<void> {
  try {
    const qstash = GetQStashClient();
    const res = await qstash.publishJSON({
      url: `https://${qstashTargetDomain()}/qstash/pre-assessment-report`,
      body: { pre_assessment_id: preAssessmentId },
    });
    console.log(
      `[qstash] pre-assessment-report scheduled: pre_assessment=${preAssessmentId} messageId=${res.messageId}`
    );
  } catch (err) {
    console.error(
      `[qstash] pre-assessment-report publish FAILED: pre_assessment=${preAssessmentId}`,
      err
    );
    throw err;
  }
}
