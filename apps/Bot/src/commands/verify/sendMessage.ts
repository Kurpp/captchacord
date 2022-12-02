import { Command } from "@sapphire/framework";
import type { TextChannel } from "discord.js";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v9";

export default class PingCommand extends Command {
  public constructor(ctx: Command.Context) {
    super(ctx);
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("sendverifymessage")
          .setDescription(
            "Sends the prompt containing the button for verification"
          )
          .addChannelOption((opt) =>
            opt
              .setName("channel")
              .setDescription("The channel to send the message in")
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
      { idHints: ["1048065466314268724"] }
    );

  }

  public override async chatInputRun(
    interaction: Command.ChatInputInteraction
  ) {
    const channel = interaction.options.getChannel(
      "channel",
      true
    ) as TextChannel;

    try {
      const message = await channel.send({
        content: "Click here to verify",
        components: [
          {
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                style: "PRIMARY",
                label: "Verify",
                customId: "verify",
              },
            ],
          },
        ],
      });

      await this.container.db.verifyMessage.create({
        data: {
          id: message.id,
          content: message.content,
          guildId: message.guildId!,
          channelId: message.channelId,
        }
      })

      interaction.reply({
        content: "Message sent",
        ephemeral: true,
      });
    } catch (err) {
      interaction.reply({
        content: `Failed to send message\n${err}`,
        ephemeral: true,
      });
    }
  }
}
