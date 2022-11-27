import "dotenv/config";
import { Intents } from "discord.js";
import { SapphireClient } from "@sapphire/framework";

const client = new SapphireClient({
  intents: [Intents.FLAGS.GUILDS],
});

client.login();
