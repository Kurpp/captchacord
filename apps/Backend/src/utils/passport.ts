import type { User } from "../typings";
import { Strategy } from "passport-discord";
import { BitField } from "@sapphire/bitfield";
import fastifyPassport from "@fastify/passport";
import { OAuth2Scopes, PermissionFlagsBits } from "discord-api-types/v10";

const cache = new Map<string, User>();
const permissions = new BitField(PermissionFlagsBits);  

export default function setupPassport() {
  const strat = new Strategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
      scope: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
    },
    (access, _, profile, cb) => {
      const account = Object.assign(profile, {
        guilds: profile.guilds?.filter((guild) =>
          permissions
            .toArray(BigInt(guild.permissions!))
            .includes("ManageGuild")
        ),
        access_token: access,
      });

      cache.set(access, account);

      setTimeout(() => {
        cache.delete(access);
      }, 10 * 60 * 1000);

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

            const cachedUser = cache.get(token);

            if (!cachedUser) {
              await req.logout();
              return resolve(null);
            }

            const user = Object.assign(cachedUser, {
              guilds: guilds?.filter((guild) =>
                permissions
                  .toArray(BigInt(guild.permissions!))
                  .includes("ManageGuild")
              ),
            });

            cache.set(token, user);

            return resolve(user);
          }
        );
      })
  );
}
