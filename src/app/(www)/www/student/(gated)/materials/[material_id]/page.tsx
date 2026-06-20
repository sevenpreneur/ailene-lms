import MaterialDetailsAILN from "@/components/pages/MaterialDetailsAILN";
import AppPageState from "@/components/states/AppPageState";
import { getProgramGate } from "@/lib/gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materi",
};

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ material_id: string }>;
}) {
  const { material_id: materialId } = await params;

  const { sessionToken, ailMember } = await getProgramGate();
  if (!sessionToken) return null;

  if (!materialId) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  if (
    !ailMember ||
    (ailMember.role !== "STUDENT" && ailMember.role !== "CHAMPION")
  ) {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return (
    <MaterialDetailsAILN sessionToken={sessionToken} materialId={materialId} />
  );
}
