import { getMaterialDetails } from "@/apis/learnings";
import MaterialDetailsAILN from "@/components/pages/MaterialDetailsAILN";
import AppPageState from "@/components/states/AppPageState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materi",
};

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ project_id: string; material_id: string }>;
}) {
  const { material_id: materialId } = await params;

  if (!materialId) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const material = await getMaterialDetails(materialId);
  if (!material) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  return <MaterialDetailsAILN material={material} />;
}
