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

export async function mustManageGuild(
  req: FastifyRequest<{ Params: { id?: string } }>,
  res: FastifyReply,
  next: HookHandlerDoneFunction
) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .send({ statusCode: 400, message: "Missing guild id" });
  }

  if (!req.user!.guilds?.some((g) => g.id === id)) {
    return res
      .status(400)
      .send({ statusCode: 400, message: "You cannot manage this guild" });
  }

  return next();
}
