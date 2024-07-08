import logger from "./logger";
import sleep from "./sleep";

type RetryStrategy = "exponential" | "fixed";

interface RetryConfig {
  maxRetries: number;
  strategy: RetryStrategy;
  initialDelay: number;
  maxDelay: number;
  fixedDelay: number;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  strategy: "exponential",
  initialDelay: 1000,
  maxDelay: 30000,
  fixedDelay: 2000,
};

/**
 * Calculates the delay for exponential backoff strategy.
 *
 * @param attempt - The current attempt number.
 * @param initialDelay - The initial delay in milliseconds.
 * @param maxDelay - The maximum delay in milliseconds.
 *
 * @returns The calculated delay for the given attempt.
 */
export const exponentialBackoff = (
  attempt: number,
  initialDelay: number,
  maxDelay: number
): number => Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

/**
 * Executes a function or promise with retry logic based on the provided configuration.
 *
 * @param fnOrPromise - The function or promise to execute with retry logic.
 * @param userConfig - The user-defined configuration for retry behavior (optional).
 *
 * @returns A promise that resolves to the result of the function or promise.
 */
export default async function withRetry<T>(
  fnOrPromise: (() => Promise<T>) | Promise<T>,
  userConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...defaultConfig, ...userConfig };
  const { maxRetries, strategy, initialDelay, maxDelay, fixedDelay } = config;

  const executePromise =
    typeof fnOrPromise === "function" ? fnOrPromise : () => fnOrPromise;

  const retry = async (attempt: number): Promise<T> => {
    try {
      return await executePromise();
    } catch (error) {
      if (attempt >= maxRetries) {
        logger.error(error, `[With Retry] All retries failed`);
        throw error;
      }

      const delay =
        strategy === "exponential"
          ? exponentialBackoff(attempt, initialDelay, maxDelay)
          : fixedDelay;

      logger.error(
        error,
        `[With Retry] Attempt ${attempt} failed - Retrying in ${delay}ms`
      );

      await sleep(delay);
      return retry(attempt + 1);
    }
  };

  return retry(0);
}
