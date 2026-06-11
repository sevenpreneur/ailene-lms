import MaterialDetailsAILN from "@/components/pages/MaterialDetailsAILN";
import AppPageState from "@/components/states/AppPageState";
import { getAilGate } from "@/lib/ail-gate";
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

  const { sessionToken, ailMember } = await getAilGate();
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
