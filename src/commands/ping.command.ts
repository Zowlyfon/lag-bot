
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import {Service} from 'typedi';
import CommandInterface from '../command.interface';

@Service()
export default class PingCommand implements CommandInterface {
    command = 'ping';

    async init(): Promise<void> {
        return;
    }

    async runCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply('Pong!');
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');
    }
}