import {
  getDepartmentRoi,
  getOutcomeOverview,
  getRoiTrend,
  getTopPerformers,
} from "@/apis/sponsor";
import RoiProductivityAILN from "@/components/pages/RoiProductivityAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI Productivity",
};

export default async function RoiPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const [overview, roiTrend, departmentRoi, topPerformers] = await Promise.all([
    getOutcomeOverview(project_id),
    getRoiTrend(project_id),
    getDepartmentRoi(project_id),
    getTopPerformers(project_id),
  ]);

  return (
    <RoiProductivityAILN
      overview={overview}
      roiTrend={roiTrend}
      departmentRoi={departmentRoi}
      topPerformers={topPerformers}
    />
  );
}
