import type { User } from "../typings";
import { Strategy } from "passport-discord";
import { BitField } from "@sapphire/bitfield";
import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import { OAuth2Scopes, PermissionFlagsBits } from "discord-api-types/v10";

const permissions = new BitField(PermissionFlagsBits);

export default function setupPassport(server: FastifyInstance) {
  const { cache } = server;

  const strat = new Strategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
      scope: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
    },
    async (access, _, profile, cb) => {
      const account = Object.assign(profile, {
        guilds: profile.guilds?.filter((guild) =>
          permissions
            .toArray(BigInt(guild.permissions!))
            .includes("ManageGuild")
        ),
        access_token: access,
      });

      await cache.set(access, JSON.stringify(account), {
        EX: 60 * 10,
      });

      return cb(null, account);
    }
  );

  fastifyPassport.use(strat);

  fastifyPassport.registerUserSerializer(
    async (user: User) => user.access_token
  );

  fastifyPassport.registerUserDeserializer(
    async (token: string, req) =>
      new Promise((resolve, reject) => {
        strat.checkScope(
          "guilds",
          token,
          async function (err, guilds: Strategy.GuildInfo[]) {
            if (err) {
              return reject(err);
            }

            const cachedUser = await cache.get(token);

            if (!cachedUser) {
              await req.logout();
              return resolve(null);
            }

            const user = Object.assign(JSON.parse(cachedUser), {
              guilds: guilds?.filter((guild) =>
                permissions
                  .toArray(BigInt(guild.permissions!))
                  .includes("ManageGuild")
              ),
            });

            cache.set(token, JSON.stringify(user), {
              EX: await cache.ttl(token),
            });

            return resolve(user);
          }
        );
      })
  );
}
