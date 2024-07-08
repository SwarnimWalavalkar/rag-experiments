import { createAnthropic } from "@ai-sdk/anthropic";
import { experimental_createProviderRegistry as createProviderRegistry } from "ai";
import config from "../../../config";
import { createOpenAI } from "@ai-sdk/openai";

export const aiRegistry = createProviderRegistry({
  anthropic: createAnthropic({ apiKey: config.anthropic.apiKey }),
  openai: createOpenAI({
    compatibility: "strict",
    apiKey: config.openai.apiKey,
  }),
  together: createOpenAI({
    compatibility: "compatible",
    baseURL: config.together.baseURL,
    apiKey: config.together.apiKey,
  }),
});
