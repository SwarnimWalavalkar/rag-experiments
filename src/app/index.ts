import fastify from "fastify";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import cookie, { FastifyCookieOptions } from "@fastify/cookie";

import {
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
} from "../utils/error";
import { fastifyPlugin } from "../lib/als";
import logger from "../utils/logger";
import v1Routes from "./v1";
import config from "../config";
import { User } from "../schema/user";
import { APIError } from "../shared/errors";
import {
  validatorCompiler,
  jsonSchemaTransform,
} from "./utils/fastifyZodTypeProvider";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import authRequiredHook from "./hooks/authRequired";
import { ZodTypeProvider } from "./types/fastify";

process.on("uncaughtException", uncaughtExceptionHandler);
process.on("unhandledRejection", unhandledRejectionHandler);

const app = fastify({
  ignoreTrailingSlash: true,
  logger: false,
  trustProxy: true,
  disableRequestLogging: true,
});

app.setValidatorCompiler(validatorCompiler);

app.withTypeProvider<ZodTypeProvider>();

app.register(fastifyPlugin, {
  useHeader: true,
  headerName: "x-request-id",
});

app.register(helmet);

app.register(sensible);

app.register(cookie, {
  secret: config.jwt.tokenSecret,
} as FastifyCookieOptions);

app.decorate("authRequired", authRequiredHook);

app.addHook("onRequest", (req, reply, done) => {
  reply.header("Pragma", "no-cache");
  reply.header(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0"
  );

  reply.header("X-Powered-By", "Passion and Love");
  logger.info({
    req: {
      method: req.raw.method,
      url: req.raw.url,
      headers: req.raw.headers,
      query: req.query,
      body: req.body,
    },
    msg: "request received",
  });
  done();
});

app.addHook("onResponse", (_req, reply, done) => {
  logger.info({
    msg: "request completed, done",
    res: { statusCode: reply.raw.statusCode, message: reply.raw.statusMessage },
  });
  done();
});

if (config.isDevelopment) {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: config.name,
        description: `${config.name} API spec`,
        version: config.version,
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUI, {
    routePrefix: "/api/v1/docs",
  });
}

app.register(v1Routes, { prefix: `/api/${config.version}/${config.name}` });

app.get("/ping", (_req, reply) => {
  reply.status(200).send("PONG");
});

app.setErrorHandler(function (error: APIError, _req, reply) {
  if (error instanceof APIError) {
    return reply.status(error.status).send({ error });
  } else {
    if (reply.raw.statusCode === 500) {
      logger.error({
        err: error,
      });

      const wrappedError = new APIError();

      return reply.status(wrappedError.status).send({ error: wrappedError });
    }
    reply.send(error);
  }
});

export default app;
