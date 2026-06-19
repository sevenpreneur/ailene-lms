import OpenAI from "openai";
import type { ChatModel } from "openai/resources/shared";

export type OpenAIModel = ChatModel | (string & {});

export const OPENAI_MODELS = {
  // Latest flagship for complex reasoning, coding, and professional work.
  GPT_5_5: "gpt-5.5",
  // More affordable frontier model for coding and professional work.
  GPT_5_4: "gpt-5.4",
  // Strong mini model for coding, computer use, and subagents.
  GPT_5_4_MINI: "gpt-5.4-mini",
  // Low-latency, lower-cost option for lightweight workloads.
  GPT_5_4_NANO: "gpt-5.4-nano",
  // Previous flagship general-purpose reasoning model.
  GPT_5: "gpt-5",
  // Strong default for reasoning, writing, and structured outputs.
  GPT_5_MINI: "gpt-5-mini",
  // Faster, cheaper GPT-5 option for simple classification or short text.
  GPT_5_NANO: "gpt-5-nano",
  // Balanced GPT-4.1 option for general chat and content generation.
  GPT_4_1_MINI: "gpt-4.1-mini",
  // Low-cost GPT-4.1 option for lightweight extraction or tagging.
  GPT_4_1_NANO: "gpt-4.1-nano",
  // Multimodal-friendly model for vision/audio-capable workflows.
  GPT_4O_MINI: "gpt-4o-mini",
} as const satisfies Record<string, OpenAIModel>;

let client: OpenAI | null = null;

export default function GetOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
