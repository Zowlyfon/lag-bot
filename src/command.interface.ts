import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

export default interface CommandInterface {
    command: string;
    init(): void;
    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder;
}