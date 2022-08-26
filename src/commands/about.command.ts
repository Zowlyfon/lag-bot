import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { Service } from 'typedi';
import CommandInterface from '../command.interface';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';
import { InteractionHandler } from '../interaction-handler.type';

@Service()
export default class AboutCommand implements CommandInterface {
    command = 'about';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    async init(): Promise<void> {
        return;
    }

    async runCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle(`About Lag-Bot`)
            .setURL('https://github.com/Zowlyfon/lag-bot')
            .setDescription('Lag-Bot was lovely made in TypeScript by Zowlyfon and other GNULag users.')
            .addFields(
                { name: 'Repository', value: 'https://github.com/Zowlyfon/lag-bot' },
                { name: 'Licence', value: 'GNU Affero General Public License v3.0' },
            )
            .setColor('Green');

        await interaction.reply({ embeds: [embed] });
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder().setName('about').setDescription('Display information about the bot.');
    }
}
