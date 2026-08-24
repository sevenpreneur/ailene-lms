import SubmitPromptAILN from "@/components/forms/SubmitPromptAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerjakan Prompt",
};

export default async function StudentPromptPracticePage({
  params,
}: {
  params: Promise<{ prompt_id: string }>;
}) {
  const { prompt_id } = await params;
  const promptIdNum = Number(prompt_id);

  return <SubmitPromptAILN promptId={promptIdNum} />;
}
