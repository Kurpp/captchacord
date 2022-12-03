import {
  Routes,
  type APIGuild,
  PermissionFlagsBits,
} from "discord-api-types/v10";
import { BitField } from "@sapphire/bitfield";
import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import type { Strategy } from "passport-discord";
import { requireAuth } from "../middlewares/auth_middleware.js";

export default async function (router: FastifyInstance) {
  const { rest } = router;
  const permissions = new BitField(PermissionFlagsBits);

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
        const rawUserGuilds = req.user!.guilds;

        const botGuilds: Strategy.GuildInfo[] = [];
        const userGuilds = rawUserGuilds
          ?.filter((guild) =>
            permissions
              .toArray(BigInt(guild.permissions!))
              .includes("ManageGuild")
          )
          ?.filter((g) => {
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
