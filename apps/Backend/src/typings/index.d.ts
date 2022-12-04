import type { PassportUser } from "fastify";
import type { REST } from "@discordjs/rest";
import type { RedisClientType } from "redis";
import type { Profile } from "passport-discord";
import type { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
    rest: REST;
    cache: RedisClientType;
  }
  interface PassportUser extends User {}
}

interface User extends Profile {
  access_token: string;
}
