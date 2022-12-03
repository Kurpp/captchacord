import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import { Routes, APIGuild } from "discord-api-types/v10";
import { requireAuth } from "../middlewares/auth_middleware.js";

export default async function (router: FastifyInstance) {
  const { rest } = router;

  router.get(
    "/login",
    fastifyPassport.authenticate("discord", {
      failureRedirect: "/",
      successRedirect: `${process.env.FRONTEND_URL}/dash`,
    })
  );

  router.get(
    "/guilds",
    {
      preHandler: requireAuth,
    },
    async (req, res) => {
      try {
        const rawBotGuilds = (await rest.get(
          Routes.userGuilds()
        )) as APIGuild[];

        const userGuilds = req.user!.guilds;
        const userGuildIds = userGuilds?.map((guild) => guild.id);
        const botGuilds = rawBotGuilds.filter(({ id }) =>
          userGuildIds?.includes(id)
        );

        return res.send({
          botGuilds,
          userGuilds,
        });
      } catch (err) {
        return res
          .status(400)
          .send({ statusCode: 400, message: "Something went wrong" });
      }
    }
  );
}

export const autoPrefix = "/discord";
