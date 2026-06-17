import { createTRPCRouter } from "@/trpc/init";
import { readGroupAilene } from "./read-group.ailene";
import { readOutcome } from "./read-outcome.ailene";
import { readPreAssessment } from "./read-pre-assessment.ailene";
import { readReportAilene } from "./read-report.ailene";

// Read sub-routers whose procedures live in the ailene folder. The top-level
// read.ts nests these under read.group / read.outcome / read.report, and
// spreads the pre-assessment org aggregations into read.preAssessment
// alongside the member-scoped `mine` procedure it owns.

export const aileneGroupRouter = createTRPCRouter({
  departments: readGroupAilene.departments,
  overview: readGroupAilene.overview,
  levelDistribution: readGroupAilene.levelDistribution,
  topUseCases: readGroupAilene.topUseCases,
  attentionMembers: readGroupAilene.attentionMembers,
});

export const aileneOutcomeRouter = createTRPCRouter({
  // sponsor-scoped end-of-program results (current state)
  overview: readOutcome.overview,
  levelDistribution: readOutcome.levelDistribution,
  roiTrend: readOutcome.roiTrend,
  departmentRoi: readOutcome.departmentRoi,
  topPerformers: readOutcome.topPerformers,
});

export const aileneReportRouter = createTRPCRouter({
  champion: readReportAilene.championReport,
});

// sponsor-scoped org aggregations (optional group_id filter) — spread into the
// read.preAssessment router next to the member's own `mine` query.
export const ailenePreAssessmentOrg = {
  departments: readPreAssessment.departments,
  overview: readPreAssessment.overview,
  pillars: readPreAssessment.pillars,
  usageFrequency: readPreAssessment.usageFrequency,
  tools: readPreAssessment.tools,
  teamMaturity: readPreAssessment.teamMaturity,
  safetyGaps: readPreAssessment.safetyGaps,
  topUseCases: readPreAssessment.topUseCases,
  voice: readPreAssessment.voice,
};
