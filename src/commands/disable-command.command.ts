import { Service } from 'typedi';
import CommandInterface from '../command.interface';
import DatabaseService from '../services/database.service';
import DiscordService from '../services/discord.service';
import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';
import { InteractionHandler } from '../interaction-handler.type';

@Service()
export default class DisableCommandCommand implements CommandInterface {
    command = 'disable-command';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    constructor(private discordService: DiscordService, private db: DatabaseService) {}

    async init(): Promise<void> {
        this.subCommands.push(
            {
                command: 'disable-guild',
                runCommand: async (interaction) => {
                    const command = interaction.options.getString('command');

                    if (!command) return;

                    const commands = this.discordService.getCommands().map((c) => c.command);

                    if (commands.find((c) => command === c) === undefined) {
                        await interaction.reply({ content: 'Command does not exist', ephemeral: true });
                        return;
                    }

                    await this.db.addDisabledCommand(interaction.guildId as string, command);
                    await interaction.reply('Command: ' + command + ' has been disabled');
                },
            },
            {
                command: 'enable-guild',
                runCommand: async (interaction) => {
                    const command = interaction.options.getString('command');

                    if (!command) return;

                    const result = await this.db.removeDisabledCommand(interaction.guildId as string, command);

                    if (result) {
                        await interaction.reply({ content: 'Enabled command', ephemeral: true });
                        return;
                    } else {
                        await interaction.reply({ content: 'Command could not be enabled', ephemeral: true });
                        return;
                    }
                },
            },
        );
    }

    async runCommand(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        if (
            !interaction.member ||
            typeof interaction.member.permissions === 'string' ||
            !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
        ) {
            await interaction.reply({ content: 'You do not have permissions to run this command', ephemeral: true });
            return;
        }
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Disable bot commands')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('disable-guild')
                    .setDescription('Disable a command in the server')
                    .addStringOption((option) =>
                        option.setName('command').setDescription('The command to disable').setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('enable-guild')
                    .setDescription('Enables a command in the server')
                    .addStringOption((option) =>
                        option.setName('command').setDescription('The command to enable').setRequired(true),
                    ),
            );
    }
}
