import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";

export default async function (router: FastifyInstance) {
  router.get(
    "/login",
    fastifyPassport.authenticate("discord", {
      failureRedirect: "/",
      successRedirect: `${process.env.FRONTEND_URL}/dash`,
    })
  );

  router.get("/", (req, res) =>
    req.isAuthenticated()
      ? res.send(req.user)
      : res.status(400).send({ statusCode: 400, message: "Not authenticated" })
  );
}

export const autoPrefix = "/discord";
