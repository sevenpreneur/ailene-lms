import CreateSelfPracticeAILN from "@/components/forms/CreateSelfPracticeAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catat Latihan",
};

export default function AddPracticePage() {
  return <CreateSelfPracticeAILN />;
}
