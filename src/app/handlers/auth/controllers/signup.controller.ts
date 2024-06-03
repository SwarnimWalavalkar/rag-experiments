import { UserInsert } from "../../../../schema/user";
import * as argon2 from "argon2";
import { z } from "zod";
import { createUser, fetchUser } from "../../../services/user/user.service";
import { BadRequest } from "../../../../shared/errors";
import { FastifyReply, FastifyRequest } from "fastify";

const body = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    username: z
      .string()
      .regex(/^(\w){1,15}$/)
      .min(1)
      .max(15)
      .toLowerCase(),
  })
  .required();

export default {
  schema: {
    body,
  },
  handler: async (
    req: FastifyRequest<{ Body: z.infer<typeof body> }>,
    reply: FastifyReply
  ) => {
    const { email, name, username, password } = req.body;

    const foundUserRes = await fetchUser(email);

    if (foundUserRes.ok) {
      throw new BadRequest("USER_ALREADY_EXISTS");
    }

    const passHash = await argon2.hash(password);

    const userAttrs: UserInsert = {
      username,
      name,
      email,
      password: passHash,
    };

    const newUserRes = await createUser(userAttrs);

    if (!newUserRes.ok) {
      throw newUserRes.error;
    }

    return reply.status(201).send({ success: true });
  },
};
