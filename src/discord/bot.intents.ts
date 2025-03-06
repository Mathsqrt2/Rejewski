import { GatewayIntentBits } from 'discord.js';

export const BotIntents = {
    useFactory: () => ({
        token: process.env.DISCORD_TOKEN,
        discordClientOptions: {
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessageReactions,
            ],
        },
    })
}