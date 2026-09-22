import { getProjectAccess } from "@/apis/auth";
import { getLevelDistribution, getWorkforceMembers } from "@/apis/sponsor";
import WorkforceSponsorAILN from "@/components/pages/WorkforceSponsorAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workforce",
};

export default async function WorkforcePage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [levelDistribution, workforceMembers, access] = await Promise.all([
    getLevelDistribution(project_id),
    getWorkforceMembers(project_id),
    getProjectAccess(project_id),
  ]);

  return (
    <WorkforceSponsorAILN
      levelDistribution={levelDistribution}
      workforceMembers={workforceMembers}
      org={access?.company_name ?? null}
      program={access?.name ?? ""}
    />
  );
}
