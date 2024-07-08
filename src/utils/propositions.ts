import {
  Paragraph,
  PropositionsServiceError,
} from "../app/services/ai/propositions.service";
import { Ok, Err, Result } from "../shared/result";
import assertDefined from "./assertDefined";
import logger from "./logger";

const WHITESPACE_CHARS = [" ", "\t", "\n", "\r"];
const SENTENCE_END_CHARS = [".", "!", "?", "\n"];

const isWhitespace = (char: string): boolean => WHITESPACE_CHARS.includes(char);

const isSentenceEnd = (char: string): boolean =>
  SENTENCE_END_CHARS.includes(char);

const countWords = (str: string): number =>
  str.split(/\s+/).filter(Boolean).length;

export const splitContentIntoParagraphs = (
  content: string
): Result<Array<Paragraph>, PropositionsServiceError> => {
  try {
    const results: Paragraph[] = [];
    let startIndex = 0;
    const MIN_PARAGRAPH_LENGTH = 150;

    while (startIndex < content.length) {
      let currIndex = startIndex;
      let wordCount = 0;

      while (currIndex < content.length && wordCount < MIN_PARAGRAPH_LENGTH) {
        let char = assertDefined(content[currIndex]);

        while (currIndex < content.length && !isWhitespace(char)) {
          currIndex++;
          if (currIndex < content.length)
            char = assertDefined(content[currIndex]);
        }
        wordCount++;

        if (wordCount >= MIN_PARAGRAPH_LENGTH) {
          while (currIndex < content.length && !isSentenceEnd(char)) {
            currIndex++;
            if (currIndex < content.length)
              char = assertDefined(content[currIndex]);
          }
          if (currIndex < content.length) currIndex++;
        }

        while (currIndex < content.length && isWhitespace(char)) {
          currIndex++;
          if (currIndex < content.length)
            char = assertDefined(content[currIndex]);
        }
      }

      let paragraph = content.slice(startIndex, currIndex).trim();

      if (results.length > 0 && countWords(paragraph) < MIN_PARAGRAPH_LENGTH) {
        let lastParagraph = assertDefined(results[results.length - 1]);

        lastParagraph.paragraphText += " " + paragraph;
        lastParagraph.locationOfParagraph[1] = currIndex;
      } else {
        results.push({
          paragraphText: paragraph,
          locationOfParagraph: [startIndex, currIndex],
          paragraphId: `p${results.length + 1}`,
        });
      }

      startIndex = currIndex;
    }

    return Ok(results);
  } catch (error) {
    logger.error(
      error,
      `[Error Splitting Content] ${(error as Error).message}`
    );
    return Err(
      new PropositionsServiceError(
        `[Error Splitting Content] ${(error as Error).message}`
      )
    );
  }
};
