import { FastifyRequest, FastifyReply, FastifyError } from "fastify";
export default async function adminRequiredHook(
  req: FastifyRequest,
  reply: FastifyReply,
  done: (err?: FastifyError) => void
) {
  if (req.user) {
    if (req.user.roles && req.user.roles.includes("admin")) {
      return;
    } else return reply.forbidden("__");
  } else {
    return reply.unauthorized();
  }
}
