import "dotenv/config";
import fastify from "fastify";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import fastifyCors from "@fastify/cors";
import fastifyPassport from "@fastify/passport";
import fastifyAutoload from "@fastify/autoload";
import { Profile, Strategy } from "passport-discord";
import fastifySecureSession from "@fastify/secure-session";

const cache = new Map<string, Profile>();

const server = fastify();

server.register(fastifySecureSession, {
  key: Buffer.from(process.env.SECRET_KEY!, "hex"),
  cookie: {
    path: '/',
  },
});

server.register(fastifyPassport.initialize());
server.register(fastifyPassport.secureSession());

fastifyPassport.use(
  new Strategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
      scope: ["identify", "guilds"],
    },
    (_, __, account, cb) => {
      cache.set(account.id, account);

      setTimeout(() => {
        cache.delete(account.id);
      }, 10 * 60 * 1000);

      return cb(null, account);
    }
  )
);

fastifyPassport.registerUserSerializer(async (user: Profile) => user.id);
fastifyPassport.registerUserDeserializer(async (id: string) => cache.get(id));

server.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN!,
  credentials: true,
});

server.register(fastifyAutoload, {
  dir: join(dirname(fileURLToPath(import.meta.url)), "routes"),
  options: {
    prefix: "/v1",
  },
});

server.listen(
  { port: parseInt(process.env.PORT!), host: "0.0.0.0" },
  (err, address) =>
    err
      ? (console.error(err), process.exit(1))
      : console.log(`Server listening on ${address}`)
);
