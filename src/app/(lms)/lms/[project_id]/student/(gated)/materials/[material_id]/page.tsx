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

  return <MaterialDetailsAILN materialId={materialId} />;
}
