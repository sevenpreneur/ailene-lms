import ExploreAILN from "@/components/pages/ExploreAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore",
};

// Isi sama persis dengan /explore di root; sidebar-nya dari layout (gated).
export default function StudentExplorePage() {
  return <ExploreAILN />;
}
