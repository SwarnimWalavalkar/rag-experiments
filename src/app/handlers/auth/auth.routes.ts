import { FastifyPluginOptions } from "fastify";
import loginController from "./controllers/login.controller";
import signupController from "./controllers/signup.controller";
import { FastifyZodInstance } from "../../types/fastify";

export default function routes(
  app: FastifyZodInstance,
  _: FastifyPluginOptions,
  done: (err?: Error | undefined) => void
) {
  app.post("/signup", signupController);
  app.post("/login", loginController);

  done();
}
