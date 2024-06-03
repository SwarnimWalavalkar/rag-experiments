import { FastifyReply, FastifyRequest } from "fastify";

export default {
  async handler(req: FastifyRequest, reply: FastifyReply) {
    return reply.send({ user: req.user });
  },
};
