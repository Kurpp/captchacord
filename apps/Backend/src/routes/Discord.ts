import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import { requireAuth } from "../middlewares/auth_middleware.js";

export default async function (router: FastifyInstance) {
  router.get(
    "/login",
    fastifyPassport.authenticate("discord", {
      failureRedirect: "/",
      successRedirect: `${process.env.FRONTEND_URL}/dash`,
    })
  );

  router.get(
    "/",
    {
      preHandler: requireAuth,
    },
    async (req, res) => {
      res.send(req.user);
    }
  );
}

export const autoPrefix = "/discord";
