import { ServiceError } from "../../../shared/errors";
import { Err, Ok, Result } from "../../../shared/result";
import logger from "../../../utils/logger";
import unwrapResult from "../../../utils/unwrapResult";
import { generateObject } from "ai";
import { aiRegistry } from "./registry.service";
import z from "zod";
import config from "../../../config";
import { writeFile } from "fs/promises";
import withRetry from "../../../utils/withRetry";
import { executeRateLimitedPromisesConcurrently } from "../../../utils/executeRateLimitedPromises";
import { splitContentIntoParagraphs } from "../../../utils/propositions";

export class PropositionsServiceError extends ServiceError {
  constructor(message: string, source?: string) {
    super("Propositions Service Error", message, source);
    this.name = this.constructor.name;
  }
}

export interface Paragraph {
  paragraphText: string;
  locationOfParagraph: [number, number];
  paragraphId: string;
}

export const generatePropositions = async (
  content: string
): Promise<Result<Array<string>, PropositionsServiceError>> => {
  try {
    const paragraphs = unwrapResult(splitContentIntoParagraphs(content));

    const BATCH_SIZE = 5;
    const paragraphBatches = Array.from(
      { length: Math.ceil(paragraphs.length / BATCH_SIZE) },
      (_, i) => paragraphs.slice(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE)
    );

    await writeFile(
      "content_paragraphs.json",
      JSON.stringify(paragraphBatches, undefined, 2)
    );

    const propositionsPromises = paragraphBatches.map((batch) =>
      withRetry(
        generateObject({
          model: aiRegistry.languageModel(
            config.ai.propositions.defaultModelID
          ),
          schema: z.object({ propositions: z.array(z.string()) }),
          system: config.constants.PROMPTS.PROPOSITIONS_PROMPT,
          prompt:
            "Decompose the following paragraphs: \n" +
            batch.map((p) => p.paragraphText).join("\n\n"),
        })
      )
    );

    const propositionsResults = await executeRateLimitedPromisesConcurrently(
      propositionsPromises,
      50
    );

    const propositions = propositionsResults.flatMap(
      (p) => p.object.propositions
    );

    return Ok(propositions);
  } catch (error) {
    logger.error(error, `[Propositions Service] ${(error as Error).message}`);
    return Err(
      new PropositionsServiceError(
        `[Propositions Service Error] ${(error as Error).message}`
      )
    );
  }
};
