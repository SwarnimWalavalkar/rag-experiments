import { queueWebpageScrape } from "../../../../hermes/events/queueWebpageScrape";
import { fetchUser } from "../../../services/user/user.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { APIError } from "../../../../shared/errors";
import { z } from "zod";

const body = z
  .object({
    urls: z.array(z.string().url("Must be a valid URL.")),
  })
  .required();

export default {
  schema: {
    body,
  },

  async handler(
    req: FastifyRequest<{
      Body: z.infer<typeof body>;
      Params: { usernameOrUUID: string };
    }>,
    reply: FastifyReply
  ) {
    const { usernameOrUUID } = req.params;
    const { urls } = req.body;

    const user = await fetchUser(usernameOrUUID);

    if (!user.ok) {
      throw new APIError(user.error.message);
    }

    await Promise.all(
      urls.map((url) =>
        queueWebpageScrape.publish({ url, user_id: user.value.id })
      )
    );

    return reply.send();
  },
};
