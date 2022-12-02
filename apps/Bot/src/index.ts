import "dotenv/config";
import { Intents } from "discord.js";
import { LogLevel, SapphireClient } from "@sapphire/framework";

const client = new SapphireClient({
  intents: [Intents.FLAGS.GUILDS],
  logger: {
    level: LogLevel.Debug,
  }
});

client.login()
