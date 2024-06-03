import "dotenv/config";

import app from "./app";
import config from "./config";
import loaders from "./loaders";
import logger from "./utils/logger";

import closeWithGrace from "close-with-grace";
import teardown from "./utils/teardown";

closeWithGrace({ delay: 10000 }, async ({ signal, err }) => {
  if (err) {
    logger.fatal(err);
  }

  logger.info(`${signal} Received - Attempting to gracefully shutdown...`);

  await teardown();

  logger.info(`All persistent connections closed. Shutting down...`);
});

async function startServer() {
  await loaders();
  const port = config.port;

  app.listen({ port: Number(port), host: "0.0.0.0" }, (err, address) => {
    if (err) {
      logger.error(err);
      process.emit("SIGTERM");
    }

    logger.info({
      msg: `${config.name} service listening on ${address}`,
    });
  });
}

startServer();
