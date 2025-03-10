import {
    GuildMember, PartialGuildMember,
    TextChannel, VoiceChannel
} from "discord.js";

export type DiscordMember = GuildMember | PartialGuildMember;
export type DiscordChannel = TextChannel | VoiceChannel;
export type DiscordChannelType = `private` | `personal` | `public` | `admin`;