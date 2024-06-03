import { constructNetworkRequester } from "../../../lib/networkRequester";
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatModel,
  ChatCompletion,
} from "openai/resources/index.mjs";

import { ServiceError } from "../../../shared/errors";
import { Ok, Result } from "../../../shared/result";
import { redis } from "../../../dependencies/redis";
import { openAIEmbedText } from "./openai.embeddings.service";
import { CreateFAISSVectorStore } from "../vector/faiss";
import logger from "../../../utils/logger";
import config from "../../../config";
import withCache from "../../../utils/withCache";
import { tokenize } from "../../../utils/tokenize";

type AIRequestPreferences = {
  model?: ChatModel | "gpt-4o"; //  <- "gpt-4o" is not updated the in openai sdk yet
  skipCache?: boolean;
  systemPrompt?: string;
};

class OpenAIServiceError extends ServiceError {
  constructor(message: string, source?: string) {
    super("OpenAI Service Error", message, source);
    this.name = this.constructor.name;
  }
}

const openAIChatCompletionsRequest = constructNetworkRequester(
  "https://api.openai.com/v1/chat/completions",
  { Authorization: `Bearer ${config.openai.apiKey}` }
);

const vectorStore = CreateFAISSVectorStore();

const constructMessages = (
  user: string,
  system: string = config.constants.PROMPTS.DEFAULT_QUERY_PROMPT
): Array<ChatCompletionMessageParam> => {
  return [
    {
      role: "system",
      content: system,
    },
    {
      role: "user",
      content: user,
    },
  ];
};

export const openAIRequest = async (
  query: string,
  {
    model = config.openai.chatCompletions.model,
    skipCache,
    systemPrompt,
  }: AIRequestPreferences
): Promise<Result<string, OpenAIServiceError>> => {
  try {
    const CACHE_KEY = `ai-response:${query}`;

    if (!skipCache) {
      const exactMatchResponse = await redis.get(CACHE_KEY);

      if (exactMatchResponse) {
        logger.debug(`[AI Service] Returning exact match cached response`);
        return Ok(exactMatchResponse);
      }

      const queryEmbeddingsResult = await withCache(
        openAIEmbedText(query),
        `embeddings:${query}`
      );

      if (!queryEmbeddingsResult.ok) {
        throw queryEmbeddingsResult.error;
      }

      const { value: embeddedQuery } = queryEmbeddingsResult;

      const similarEmbeddings = vectorStore.getSimilarVector(embeddedQuery);

      logger.debug(`[AI Service] Similar Embedding: ${similarEmbeddings}`);

      if (similarEmbeddings) {
        logger.debug(
          `[AI Service] Similar query found: ${similarEmbeddings.label}`
        );

        const cachedResponse = await redis.get(
          `ai-response:${similarEmbeddings.label}`
        );

        if (cachedResponse) {
          logger.debug(`[AI Service] Returning cached response`);

          return Ok(cachedResponse);
        }
      } else {
        vectorStore.setVector(embeddedQuery, query);
      }
    }

    query = tokenize(query)
      .splice(0, config.openai.chatCompletions.rateLimitTPM - 100)
      .join("");

    const messages = constructMessages(query, systemPrompt);

    const { data: response } = await openAIChatCompletionsRequest.post<
      ChatCompletionCreateParams,
      ChatCompletion
    >(
      "",
      {
        model,
        messages,
      },
      {},
      {},
      { timeout: 20000, retries: 2 }
    );

    const responseText = response.choices[0]?.message.content as string;

    await redis.set(CACHE_KEY, responseText, "EX", 60 * 60 * 24);

    return Ok(responseText);
  } catch (error) {
    logger.error("[AI Service] Error responding to query", error);

    throw error;
  }
};
