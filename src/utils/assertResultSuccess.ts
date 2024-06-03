import { Result } from "../shared/result";

export function assertResultSuccess<T>(
  result: Result<unknown, Error>
): asserts result is { ok: true; value: T } {
  if (!result.ok) {
    throw result.error;
  }
}
