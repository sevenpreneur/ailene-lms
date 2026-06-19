import { createTRPCRouter } from "@/trpc/init";
import { readGroupAilene } from "./read-group.ailene";
import { readOutcome } from "./read-outcome.ailene";
import { readReportAilene } from "./read-report.ailene";

// Read sub-routers whose procedures live in the ailene folder. The top-level
// read.ts nests these under read.group / read.outcome / read.report.

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
