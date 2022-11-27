import "dotenv/config"
import fastify from "fastify";

const server = fastify();

server.get("/", () => "Hello World")

server.listen({port: parseInt(process.env.PORT!), host: "0.0.0.0"}, (err, address) =>
  err
    ? (console.error(err), process.exit(1))
    : console.log(`Server listening on ${address}`)
);
 
