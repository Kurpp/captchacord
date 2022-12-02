import { Command } from "@sapphire/framework";
import { isMessageInstance } from "@sapphire/discord.js-utilities";

export default class PingCommand extends Command {
  public constructor(ctx: Command.Context) {
    super(ctx);
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("ping")
          .setDescription("Check if bot is online"),
      { idHints: ["1048065465429278780"] }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputInteraction
  ) {
    const msg = await interaction.reply({
      content: `Ping?`,
      ephemeral: true,
      fetchReply: true,
    });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(
        `Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`
      );
    }
    
    return interaction.editReply("Failed to retrieve ping :(");
  }
}
