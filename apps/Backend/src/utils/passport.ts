import fastifyPassport from "@fastify/passport";
import { Profile, Strategy } from "passport-discord";

interface User extends Profile {
  access_token: string;
}

const cache = new Map<string, User>();

export default function setupPassport() {
  const strat = new Strategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
      scope: ["identify", "guilds"],
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
      new Promise((resolve, reject) => {
        strat.checkScope("guilds", token, async function (err, guilds) {
          if (err) {
            return reject("Invalid token");
          }

          const cachedUser = cache.get(token);

          if (!cachedUser) {
            await req.logout();
            return reject("User not found");
          }

          const user = Object.assign(cachedUser, { guilds });

          cache.set(token, user);

          return resolve(user);
        });
      })
  );
}
