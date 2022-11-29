import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";

export default async function (router: FastifyInstance) {
  router.get("/login", fastifyPassport.authenticate("discord"));

  router.get(
    "/callback",
    {
      preValidation: fastifyPassport.authenticate("discord", {
        failureRedirect: "/",
      }),
    },
    (req, res) => res.send(req.user)
  );

  router.get("/", (req, res) => req.isAuthenticated() ? res.send(req.user) : res.status(400).send({ statusCode: 400, message: "Not authenticated" }));
}

export const autoPrefix = "/discord";
