import { APIGuild, APIChannel } from "discord-api-types/v10";

export interface GuildsResponse {
  botGuilds: APIGuild[];
  userGuilds: APIGuild[];
}

export interface ConfigResponse extends APIGuild {
  channels: APIChannel[];
  verifyMessage: {
    id: string;
    channelId: string;
    guildId: string;
    content: string;
  };
}
