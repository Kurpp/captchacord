import "dotenv/config";
import { Intents } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { LogLevel, container, SapphireClient } from "@sapphire/framework";

const client = new SapphireClient({
  intents: [Intents.FLAGS.GUILDS],
  logger: {
    level: LogLevel.Debug,
  }
});

container.db = new PrismaClient();

client.login()
