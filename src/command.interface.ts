import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

export default interface CommandInterface {
    command: string;
    init(): Promise<void>;
    runCommand(interaction: ChatInputCommandInteraction): Promise<void>;
    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder;
}
