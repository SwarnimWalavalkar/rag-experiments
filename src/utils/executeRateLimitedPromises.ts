import logger from "./logger";
import sleep from "./sleep";
import { setImmediate } from "timers/promises";

/**
 * Executes an array of promises concurrently while respecting a specified rate per minute.
 *
 * @param promises An array of functions that return promises
 * @param ratePerMinute The number of promises to start per minute
 *
 * @returns A promise that resolves when all promises have been executed
 */
export const executeRateLimitedPromisesConcurrently = async <T>(
  promises: Array<Promise<T>>,
  ratePerMinute: number
): Promise<T[]> => {
  const results: T[] = [];
  const intervalMs = (60 * 1000) / ratePerMinute;
  let lastExecutionTime = 0;
  let executingCount = 0;
  let nextIndex = 0;
  let totalExecuted = 0;

  logger.info(
    `Starting execution of ${
      promises.length
    } promises at a rate of ${ratePerMinute} per minute (${intervalMs.toFixed(
      2
    )}ms interval)`
  );

  const executeNextPromise = async () => {
    if (nextIndex >= promises.length) return;

    const currentTime = Date.now();
    const timeSinceLastExecution = currentTime - lastExecutionTime;

    if (timeSinceLastExecution < intervalMs) {
      const timeToSleep = intervalMs - timeSinceLastExecution;
      logger.info(
        `Rate limit reached. Waiting ~${timeToSleep.toFixed(
          2
        )}ms before next execution.`
      );
      await sleep(timeToSleep);
    }

    lastExecutionTime = Date.now();
    const currentIndex = nextIndex++;
    executingCount++;
    totalExecuted++;

    logger.info(
      `Starting promise ${currentIndex + 1}/${
        promises.length
      } (${executingCount} currently executing, ${totalExecuted} total started)`
    );

    try {
      const currentPromise = promises[currentIndex];
      if (currentPromise) {
        const result = await currentPromise;
        results[currentIndex] = result;
        logger.info(`Promise ${currentIndex + 1} completed`);
      }
    } catch (error) {
      logger.error(error, `Error executing promise ${currentIndex}`);
    } finally {
      executingCount--;
      if (nextIndex < promises.length || executingCount > 0) {
        await setImmediate();
        executeNextPromise();
      }
    }
  };

  const initialBatch = Math.min(promises.length, ratePerMinute);
  const initialPromises = Array(initialBatch)
    .fill(null)
    .map(executeNextPromise);

  logger.info(`Launching initial batch of ${initialBatch} promises`);

  await Promise.all(initialPromises);

  while (executingCount > 0 || nextIndex < promises.length) {
    await setImmediate();
  }

  return results;
};
