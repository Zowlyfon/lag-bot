import { ChatInputCommandInteraction } from 'discord.js';

export type SubCommand = {
    command: string;
    runCommand: (interaction: ChatInputCommandInteraction) => Promise<void>;
};
