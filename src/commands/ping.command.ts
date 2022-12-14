import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { Service } from 'typedi';
import CommandInterface from '../command.interface';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';
import { InteractionHandler } from '../interaction-handler.type';

@Service()
export default class PingCommand implements CommandInterface {
    command = 'ping';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

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
