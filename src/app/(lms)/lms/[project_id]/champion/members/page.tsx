import MembersChampionAILN from "@/components/pages/MembersChampionAILN";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Champion - Detail Anggota",
};

export default function ChampionMembersPage() {
  return (
    <Suspense>
      <MembersChampionAILN />
    </Suspense>
  );
}
