import { getChampionReport, type ChampionReportPeriod } from "@/apis/champion";
import ReportChampionAILN from "@/components/pages/ReportChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Champion - Reports",
};

export default async function ChampionReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { project_id } = await params;
  const { period: periodParam } = await searchParams;
  const period: ChampionReportPeriod =
    periodParam === "monthly" ? "monthly" : "weekly";

  const data = await getChampionReport(project_id, period);

  return <ReportChampionAILN data={data} period={period} />;
}
