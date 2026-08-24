import DashboardChampionAILN from "@/components/pages/DashboardChampionAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Champion",
};

export default function ChampionPage() {
  return <DashboardChampionAILN />;
}
