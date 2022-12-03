import type {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";

export async function requireAuth(
  req: FastifyRequest,
  res: FastifyReply,
  next: HookHandlerDoneFunction
) {
  if (!req.isAuthenticated()) {
    return res
      .status(400)
      .send({ statusCode: 400, message: "Not authenticated" });
  }

  return next();
}
