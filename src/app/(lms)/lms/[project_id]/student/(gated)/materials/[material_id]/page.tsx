import {
  completeMaterial,
  getLevelMaterials,
  getMaterialDetails,
} from "@/apis/learnings";
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

  const [materialResult, levelMaterials] = await Promise.all([
    getMaterialDetails(materialId),
    getLevelMaterials(materialId),
  ]);

  if (materialResult.kind === "forbidden") {
    return (
      <AppPageState
        variant="FORBIDDEN"
        message={
          materialResult.reason === "level_locked"
            ? "Materi ini belum bisa diakses. Selesaikan bagian sebelumnya untuk membukanya."
            : "Kamu belum memiliki akses untuk membaca materi ini."
        }
      />
    );
  }
  if (materialResult.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const material = materialResult.data;

  const completion = await completeMaterial(materialId);

  const resolvedMaterial = completion
    ? {
        ...material,
        completed: completion.completed,
        completed_at: completion.completed_at,
      }
    : material;

  return (
    <MaterialDetailsAILN
      material={resolvedMaterial}
      levelMaterials={levelMaterials}
    />
  );
}
