import {
  requireAuth,
  mustManageGuild,
} from "../middlewares/auth_middleware.js";
import { Routes, type APIGuild } from "discord-api-types/v10";
import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import type { Strategy } from "passport-discord";

export default async function (router: FastifyInstance) {
  const { db, rest } = router;

  router.get(
    "/login",
    fastifyPassport.authenticate("discord", {
      failureRedirect: "/",
      successRedirect: `${process.env.FRONTEND_URL}/manage`,
    })
  );

  router.get<{ Params: { id: string } }>(
    "/guild/:id",
    {
      preHandler: [requireAuth, mustManageGuild],
    },
    async (req, res) => {
      try {
        const verifyMessage = await db.verifyMessage.findFirst({
          where: {
            guildId: req.params.id,
          },
        });

        return res.send({
          verifyMessage,
        });
      } catch (e: any) {
        return res.status(500).send({ statusCode: 500, message: e.message });
      }
    }
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

        const botGuilds: Strategy.GuildInfo[] = [];
        const userGuilds = req.user!.guilds?.filter((g) => {
          if (rawBotGuilds.some((bg) => bg.id === g.id)) {
            botGuilds.push(g);
            return false;
          }

          return true;
        });

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
