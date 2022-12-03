import { APIGuild } from "discord-api-types/v10";

export interface GuildsResponse {
    botGuilds: APIGuild[];
    userGuilds: APIGuild[];
}