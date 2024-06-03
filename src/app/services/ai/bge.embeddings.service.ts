import { Ok, Result } from "../../../shared/result";
import { ServiceError } from "../../../shared/errors";
import config from "../../../config";

class EmbeddingsServiceError extends ServiceError {
  constructor(message: string, source?: string) {
    super("BGE Embeddings Service Error", message, source);
    this.name = this.constructor.name;
  }
}

let extractor: any;

export const setupBGEModel = async () => {
  try {
    extractor = await (
      await import("@xenova/transformers")
    ).pipeline("feature-extraction", config.transformerJs.embeddings.model);
  } catch (error) {
    throw error;
  }
};

export const bgeEmbedText = async (
  text: string
): Promise<Result<Array<number>, EmbeddingsServiceError>> => {
  try {
    const embeddingsTensor = await extractor([text], {
      pooling: "cls",
      normalize: true,
    });

    const embeddings = embeddingsTensor.tolist()[0];

    return Ok(embeddings);
  } catch (error) {
    throw error;
  }
};
