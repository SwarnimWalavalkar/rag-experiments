import { IndexFlatL2 } from "faiss-node";
import { Vector, VectorStore } from "./types";
import { ServiceError } from "../../../shared/errors";
import logger from "../../../utils/logger";
import config from "../../../config";

class FAISSVectorStoreError extends ServiceError {
  constructor(message: string, source?: string) {
    super("Embeddings Service Error", message, source);
    this.name = this.constructor.name;
  }
}

export type FAISSConfig = {
  dimension: number;
};

const getConfig = (options: Partial<FAISSConfig> = {}): FAISSConfig => ({
  dimension: config.openai.embeddings.dimension,
  ...options,
});

export function CreateFAISSVectorStore(
  config: Partial<FAISSConfig> = {}
): VectorStore {
  const indexConfig = getConfig(config);
  const index = new IndexFlatL2(indexConfig.dimension);

  const vectorPositionToLabel = new Map<number, string>();
  const vectorPositionToVector = new Map<number, Vector>();

  const getSimilarVector = (
    vector: Vector
  ): ReturnType<VectorStore["getSimilarVector"]> => {
    if (index.ntotal() < 1) return null;

    const results = index.search(vector, 1);

    const mostSimilarVectorPosition = results.labels[0];
    const mostSimilarVectorDistance = results.distances[0];

    if (
      mostSimilarVectorPosition === undefined ||
      mostSimilarVectorDistance === undefined
    )
      return null;

    logger.debug(`MOST SIMILAR VECTOR POSITION: ${mostSimilarVectorPosition}`);
    logger.debug(`MOST SIMILAR VECTOR DISTANCE: ${mostSimilarVectorDistance}`);

    if (mostSimilarVectorDistance > 0.5) return null;

    // check pgvector here

    const label = vectorPositionToLabel.get(mostSimilarVectorPosition);
    const similarVector = vectorPositionToVector.get(mostSimilarVectorPosition);

    logger.debug(`LABEL: ${label}`);

    if (!similarVector || !label) return null;

    return {
      vector: similarVector,
      label: label,
    };
  };

  const setVector = (
    vector: Vector,
    label: string
  ): ReturnType<VectorStore["setVector"]> => {
    logger.debug(`VECTOR LENGTH: ${vector.length}`);

    if (vector.length !== indexConfig.dimension) {
      throw new FAISSVectorStoreError(
        `Vector length is not equal to the expected dimension of ${indexConfig.dimension}`,
        "setVector"
      );
    }

    index.add(vector);

    const position = size() - 1;

    logger.debug(`NEW VECTOR POSITION: ${position}`);
    logger.debug(`NEW VECTOR LABEL: ${label}`);

    vectorPositionToLabel.set(position, label);
    vectorPositionToVector.set(position, vector);

    logger.debug("NEW VECTOR ADDED SUCCESSFULLY!");
  };

  const size = (): ReturnType<VectorStore["size"]> => index.ntotal();

  return {
    getSimilarVector,
    setVector,
    size,
  };
}
