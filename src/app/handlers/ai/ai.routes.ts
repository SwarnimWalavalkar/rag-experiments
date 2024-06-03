import { FastifyPluginOptions } from "fastify";
import queryAIController from "./controllers/queryAI.controller";
import { FastifyZodInstance } from "../../types/fastify";

export default function routes(
  app: FastifyZodInstance,
  _: FastifyPluginOptions,
  done: (err?: Error | undefined) => void
) {
  app.post("/query", { preHandler: [app.authRequired], ...queryAIController });

  done();
}
