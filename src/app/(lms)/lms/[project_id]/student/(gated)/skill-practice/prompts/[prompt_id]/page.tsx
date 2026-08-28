import { getPromptDetails } from "@/apis/prompts";
import SubmitPromptAILN from "@/components/forms/SubmitPromptAILN";
import AppPageState from "@/components/states/AppPageState";
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

  if (!Number.isInteger(promptIdNum) || promptIdNum <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const result = await getPromptDetails(promptIdNum);
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }

  return <SubmitPromptAILN prompt={result.data} />;
}
