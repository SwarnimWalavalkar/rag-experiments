import {
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  FastifyInstance,
  FastifySchema,
  FastifyTypeProvider,
} from "fastify";

import { ZodTypeAny, z } from "zod";
import { User, CookieUser } from "../../schema/user";

declare module "fastify" {
  interface FastifyRequest {
    user: CookieUser;
  }
  interface FastifyInstance {
    authRequired: any;
  }
}

export interface ZodTypeProvider extends FastifyTypeProvider {
  output: this["input"] extends ZodTypeAny ? z.infer<this["input"]> : never;
}

export type FastifyZodInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export interface Schema extends FastifySchema {
  hide?: boolean;
}
