import { getCategories } from "@/apis/categories";
import CreateSelfPracticeAILN from "@/components/forms/CreateSelfPracticeAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catat Latihan",
};

export default async function AddPracticePage() {
  const categories = await getCategories();

  return <CreateSelfPracticeAILN categories={categories} />;
}
