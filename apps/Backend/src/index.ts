import "dotenv/config";
import fastify from "fastify";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { REST } from "@discordjs/rest";
import fastifyCors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import setupPassport from "./utils/passport.js";
import fastifyPassport from "@fastify/passport";
import fastifyAutoload from "@fastify/autoload";
import fastifySecureSession from "@fastify/secure-session";

const server = fastify();

server.db = new PrismaClient();
server.rest = new REST({version: "10"}).setToken(process.env.DISCORD_TOKEN!);

server.register(fastifySecureSession, {
  key: Buffer.from(process.env.SECRET_KEY!, "hex"),
  cookie: {
    path: "/",
  },
});

server.register(fastifyPassport.initialize());
server.register(fastifyPassport.secureSession());

setupPassport();

server.register(fastifyCors, {
  origin: process.env.FRONTEND_URL!,
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
