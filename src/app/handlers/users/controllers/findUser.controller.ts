import { z } from "zod";
import { fetchUser } from "../../../services/user/user.service";
import { NotFoundError } from "../../../../shared/errors";
import { FastifyReply, FastifyRequest } from "fastify";

const querystring = z
  .object({
    username_or_email: z.string(),
  })
  .required();

export default {
  schema: {
    querystring,
  },

  async handler(
    req: FastifyRequest<{ Querystring: z.infer<typeof querystring> }>,
    reply: FastifyReply
  ) {
    const { username_or_email } = req.query;

    const foundUserRes = await fetchUser(username_or_email);

    if (!foundUserRes.ok) {
      throw new NotFoundError("Invalid username or email");
    }

    const {
      id: _id,
      password: _password,
      created_at: _created_at,
      updated_at: _updated_at,
      ...user
    } = foundUserRes.value;

    return reply.send({ user });
  },
};
