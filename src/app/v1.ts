import type { FastifyError, FastifyPluginOptions } from "fastify";

import authRoutes from "./handlers/auth/auth.routes";
import userRoutes from "./handlers/users/users.routes";
import meRoutes from "./handlers/me/me.routes";
import aiRoutes from "./handlers/ai/ai.routes";

import { FastifyZodInstance } from "./types/fastify";

export default async function v1Routes(
  app: FastifyZodInstance,
  _: FastifyPluginOptions,
  done: (err?: FastifyError) => void
) {
  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/users" });
  app.register(meRoutes, { prefix: "/me" });
  app.register(aiRoutes, { prefix: "/ai" });

  done();
}
