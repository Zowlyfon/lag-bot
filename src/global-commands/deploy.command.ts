import CommandInterface from '../command.interface';
import DiscordService from '../services/discord.service';
import EnvironmentService from '../services/environment.service';
import { REST } from '@discordjs/rest';
import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    Routes,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { Service } from 'typedi';
import DatabaseService from '../services/database.service';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';

@Service()
export default class DeployCommand implements CommandInterface {
    command = 'deploy';
    subCommands = new Array<SubCommand>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    constructor(private discordService: DiscordService, private env: EnvironmentService, private db: DatabaseService) {}

    async init() {
        const rest = new REST({ version: '10' }).setToken(this.env.getBotSecret());

        const commandsToDeploy = [this.slashCommandBuilder().toJSON()];

        rest.put(Routes.applicationCommands(this.env.getClientId()), { body: commandsToDeploy })
            .then(() => console.log('Successfully registered application commands.'))
            .catch((e) => console.error(e));

        this.discordService.onChatCommand(this.command).subscribe(async (interaction) => {
            if (!interaction.guildId) return;

            if (
                !interaction.member ||
                typeof interaction.member.permissions === 'string' ||
                !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
            ) {
                await interaction.reply({
                    content: 'You do not have permissions to run this command',
                    ephemeral: true,
                });
                return;
            }

            const rest = new REST({ version: '10' }).setToken(this.env.getBotSecret());

            const disabledCommandClasses = await this.db.getDisabledCommands(interaction.guildId);

            const disabledCommands = disabledCommandClasses.map((c) => c.command);

            const commands = this.discordService
                .getCommands()
                .filter(async (c) => disabledCommands.find((d) => c.command === d))
                .map((c) => c.slashCommandBuilder().toJSON());

            if (!interaction.guildId) return;

            rest.put(Routes.applicationGuildCommands(this.env.getClientId(), interaction.guildId), { body: commands })
                .then(() => interaction.reply('Successfully registered commands!'))
                .catch((e) => {
                    console.error(e);
                    interaction.reply('Failed to register commands :(');
                });
        });
    }

    async runCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        return;
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder().setName(this.command).setDescription('Deploy slash commands to guild');
    }
}
