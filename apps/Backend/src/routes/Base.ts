import type { FastifyInstance } from "fastify";

export default async function (router: FastifyInstance) {
  router.get("/", () => "Hello World");
}

export const autoPrefix = "/";
