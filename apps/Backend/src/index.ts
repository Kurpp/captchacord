import "dotenv/config";
import fastify from "fastify";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import fastifyAutoload from "@fastify/autoload";

const server = fastify();

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
