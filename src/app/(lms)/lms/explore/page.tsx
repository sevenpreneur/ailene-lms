import { checkSession } from "@/apis/auth";
import DiscoverySidebarAILN from "@/components/navigations/DiscoverySidebarAILN";
import ExploreAILN from "@/components/pages/ExploreAILN";
import { LOGIN_URL } from "@/lib/config";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Explore",
};

// Discovery catalog — hardcoded from src/mock-data/explore.ts, belum ada endpoint.
export default async function ExplorePage() {
  const session = await checkSession();
  if (!session) redirect(LOGIN_URL);

  return (
    <>
      <DiscoverySidebarAILN session={session} />
      <ExploreAILN />
    </>
  );
}
