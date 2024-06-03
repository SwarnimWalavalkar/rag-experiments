import { FastifyPluginOptions } from "fastify";
import getCurrentUserController from "./controllers/getCurrentUser.controller";
import { FastifyZodInstance } from "../../types/fastify";

export default function routes(
  app: FastifyZodInstance,
  _: FastifyPluginOptions,
  done: (err?: Error | undefined) => void
) {
  app.get("/", { preHandler: [app.authRequired], ...getCurrentUserController });

  done();
}
