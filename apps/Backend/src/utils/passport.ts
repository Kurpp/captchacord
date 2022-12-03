import type { User } from "../typings";
import { Strategy } from "passport-discord";
import fastifyPassport from "@fastify/passport";
import { OAuth2Scopes } from "discord-api-types/v10"

const cache = new Map<string, User>();

export default function setupPassport() {
  const strat = new Strategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
      scope: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
    },
    (access, _, profile, cb) => {
      const account = Object.assign(profile, { access_token: access });

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
      new Promise((resolve) => {
        strat.checkScope("guilds", token, async function (err, guilds) {
          if (err) {
            return resolve(null);
          }

          const cachedUser = cache.get(token);

          if (!cachedUser) {
            await req.logout();
            return resolve(null);
          }

          const user = Object.assign(cachedUser, { guilds });

          cache.set(token, user);

          return resolve(user);
        });
      })
  );
}
