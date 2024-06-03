import config from "../../../config";
import { constructNetworkRequester } from "../../../lib/networkRequester";
import logger from "../../../utils/logger";
import { ServiceError } from "../../../shared/errors";
import { Ok, Result } from "../../../shared/result";
import {
  ChatCompletion,
  ChatCompletionCreateParams,
} from "openai/resources/index.mjs";
import { tokenize } from "../../../utils/tokenize";

type GroqModel =
  | "llama3-8b-8192"
  | "llama3-70b-8192"
  | "mixtral-8x7b-32768"
  | "gemma-7b-it";

class GroqServiceError extends ServiceError {
  constructor(message: string, source?: string) {
    super("Groq Service Error", message, source);
    this.name = this.constructor.name;
  }
}

const groqChatCompletionsRequest = constructNetworkRequester(
  "https://api.groq.com/openai/v1/chat/completions",
  { Authorization: `Bearer ${config.groq.apiKey}` }
);

export const summarizeWebpageContent = async (
  content: string,
  {
    model = config.groq.webpageContentSummarizationModel as GroqModel,
  }: { model: GroqModel }
): Promise<Result<string, GroqServiceError>> => {
  try {
    content = tokenize(content)
      .splice(0, config.groq.rateLimitTPM - 100)
      .join("");

    const { data: response } = await groqChatCompletionsRequest.post<
      ChatCompletionCreateParams,
      ChatCompletion
    >(
      "",
      {
        model: model,
        max_tokens: 1024,
        temperature: 1,
        top_p: 1,
        messages: [
          {
            role: "system",
            content: config.constants.PROMPTS.SUMMARIZE_WEBPAGE_CONTENT,
          },
          {
            role: "user",
            content,
          },
        ],
      },
      {},
      {},
      { timeout: 20000, retries: 2 }
    );

    const completion = response.choices[0]?.message.content as string;

    return Ok(completion);
  } catch (error) {
    logger.error("[AI Service] Error responding to query", error);
    throw error;
  }
};
