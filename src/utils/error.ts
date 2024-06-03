/**
 * Distinguishing the following two error types will minimize your app downtime and helps avoid crazy bugs:
 * Operational errors refer to situations where you understand what happened and the impact of it –
 * for example, a query to some HTTP service failed due to connection problem.
 * On the other hand, programmer errors refer to cases where you have no idea why and sometimes where an error came from –
 * it might be some code that tried to read an undefined value or DB connection pool that leaks memory.
 * Operational errors are relatively easy to handle – usually logging the error is enough.
 * Things become hairy when a programmer error pops up,
 * the application might be in an inconsistent state and there’s nothing better you can do than to restart gracefully
 *
 * @link https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/operationalvsprogrammererror.md
 */

import logger from "./logger";
import teardown from "./teardown";

const exitProcess = async () => {
  await teardown();

  process.exit(1);
};

/**
 * The default way of how Node.js handles such exceptions is PRESERVED!!! Namely,
 * 1. the stack trace is printed to stderr
 * 2. app exits with code 1
 * @link https://nodejs.org/api/process.html#process_event_uncaughtexception
 *
 * !!! WARNING !!!
 * It is not safe to resume normal operation after 'uncaughtException'.
 * @link https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
 */
export const uncaughtExceptionHandler = (err: Error) => {
  logger.error({ msg: "Uncaught Exception at", err });
  exitProcess();
};

/**
 * The 'unhandledRejection' event is emitted whenever a Promise is rejected and
 * no error handler is attached to the promise.
 *
 * The 'unhandledRejection' event is useful for detecting and keeping track of promises
 * that were rejected whose rejections have not yet been handled.
 *
 * @link https://nodejs.org/api/process.html#process_event_unhandledrejection
 */

export const unhandledRejectionHandler =
  process.env.NODE_ENV !== "test"
    ? (err: Error) => {
        logger.fatal({ msg: "Uncaught Rejection at", err });
        exitProcess();
      }
    : () => {};
