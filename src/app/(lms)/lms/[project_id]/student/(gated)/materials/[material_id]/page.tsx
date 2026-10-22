import { getLevelMaterials, getMaterialDetails } from "@/apis/learnings";
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
          materialResult.reason === "chapter_locked"
            ? "Chapter ini belum terbuka. Periksa jadwal sesi atau hubungi admin."
            : "Kamu belum memiliki akses untuk membaca materi ini."
        }
      />
    );
  }
  if (materialResult.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const material = materialResult.data;

  return (
    <MaterialDetailsAILN material={material} levelMaterials={levelMaterials} />
  );
}
