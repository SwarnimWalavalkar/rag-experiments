/**
 * Converts the given text into an array of tokens
 *
 * A token is presumed to be a chunk of 4 characters.
 *
 * @TODO This is incredibly naive and should be improved.
 *
 * @param text - The text to be tokenized.
 * @returns An array of strings representing the tokens.
 */
export const tokenize = (text: string): Array<string> => {
  if (text.length < 4) return [text];
  return text.match(/.{1,4}/g) ?? [];
};
