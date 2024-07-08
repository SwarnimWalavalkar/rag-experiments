import { Result } from "../shared/result";

/**
 * Unwraps the value from a `Result` object.
 *
 * @template T - The type of the value.
 * @param {Result<T, Error>} result - The `Result` object to unwrap.
 * @returns {T} - The unwrapped value.
 * @throws {Error} - If the `Result` is not successful, throw the associated error.
 */
export default function unwrapResult<T>(result: Result<T, Error>): T {
  if (!result.ok) {
    throw result.error;
  }

  return result.value;
}
