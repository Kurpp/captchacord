import {
  requireAuth,
  mustManageGuild,
} from "../middlewares/auth_middleware.js";
import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import type { Strategy } from "passport-discord";
import { Routes, type APIGuild, type APIMessage } from "discord-api-types/v10";

export default async function (router: FastifyInstance) {
  const { db, rest } = router;

  router.get(
    "/login",
    fastifyPassport.authenticate("discord", {
      failureRedirect: "/",
      successRedirect: `${process.env.FRONTEND_URL}/manage`,
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

  router.get<{ Params: { id: string } }>(
    "/guilds/:id",
    {
      preHandler: [requireAuth, mustManageGuild],
    },
    async (req, res) => {
      const { id } = req.params;

      try {
        const guild = (await rest.get(Routes.guild(id))) as APIGuild;

        if (!guild) {
          return res.status(404).send({
            statusCode: 404,
            message: "Guild not found",
          });
        }

        let verifyMessage = {};

        const verifyMessageData = await db.verifyMessage.findFirst({
          where: {
            guildId: id,
          },
        });

        if (verifyMessageData) {
          verifyMessage = (await rest.get(
            Routes.channelMessage(
              verifyMessageData?.channelId!,
              verifyMessageData?.id!
            )
          )) as APIMessage;
        }

        return res.send({
          ...guild,
          channels: await rest.get(Routes.guildChannels(id)),
          verifyMessage,
        });
      } catch (e: any) {
        return res.status(500).send({ statusCode: 500, message: e.message });
      }
    }
  );
}

export const autoPrefix = "/discord";
