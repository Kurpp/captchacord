import "dotenv/config";
import fastify from "fastify";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import fastifyCors from "@fastify/cors";
import setupPassport from "./utils/passport.js";
import fastifyPassport from "@fastify/passport";
import fastifyAutoload from "@fastify/autoload";
import fastifySecureSession from "@fastify/secure-session";

const server = fastify();

server.register(fastifySecureSession, {
  key: Buffer.from(process.env.SECRET_KEY!, "hex"),
  cookie: {
    path: "/",
  },
});

server.register(fastifyPassport.initialize());
server.register(fastifyPassport.secureSession());

setupPassport()

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
