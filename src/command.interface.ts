import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { SubCommand } from './sub-command.type';
import { Subject } from 'rxjs';

export default interface CommandInterface {
    command: string;
    subCommands: SubCommand[];
    subCommandSubject: Subject<ChatInputCommandInteraction>;
    init(): Promise<void>;
    runCommand(interaction: ChatInputCommandInteraction): Promise<void>;
    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder;
}
