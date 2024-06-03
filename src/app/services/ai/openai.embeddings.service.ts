import { constructNetworkRequester } from "../../../lib/networkRequester";
import { Err, Ok, Result } from "../../../shared/result";
import { ServiceError } from "../../../shared/errors";
import logger from "../../../utils/logger";
import config from "../../../config";
import {
  CreateEmbeddingResponse,
  EmbeddingCreateParams,
} from "openai/resources/embeddings.mjs";

class EmbeddingsServiceError extends ServiceError {
  constructor(message: string, source?: string) {
    super("OpenAI Embeddings Service Error", message, source);
    this.name = this.constructor.name;
  }
}

const openAIEmbeddingsRequest = constructNetworkRequester(
  "https://api.openai.com/v1/embeddings",
  { Authorization: `Bearer ${config.openai.apiKey}` }
);

export const openAIEmbedText = async (
  text: string
): Promise<Result<Array<number>, EmbeddingsServiceError>> => {
  try {
    const response = await openAIEmbeddingsRequest.post<
      EmbeddingCreateParams,
      CreateEmbeddingResponse
    >("", {
      input: text,
      model: config.openai.embeddings.model,
    });

    const embeddingResponse = response.data.data[0];

    if (!embeddingResponse) {
      return Err(new EmbeddingsServiceError("No embedding found in response"));
    }

    const embedding = embeddingResponse.embedding;

    return Ok(embedding);
  } catch (error) {
    logger.error("[Embeddings Service] Error embedding text", error);

    throw error;
  }
};
