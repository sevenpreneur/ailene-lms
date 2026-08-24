import RoiProductivityAILN from "@/components/pages/RoiProductivityAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI Productivity",
};

export default function RoiPage() {
  return <RoiProductivityAILN />;
}
