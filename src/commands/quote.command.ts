import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import DiscordService from '../services/discord.service';
import QuoteService from '../services/quote.service';
import EnvironmentService from '../services/environment.service';
import {
    ChatInputCommandInteraction,
    italic,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    userMention,
} from 'discord.js';
import { QuoteDocument } from '../schemas/quote.schema';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';
import { InteractionHandler } from '../interaction-handler.type';

@Service()
export default class QuoteCommand implements CommandInterface {
    command = 'quote';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    constructor(
        private discordService: DiscordService,
        private quoteService: QuoteService,
        private env: EnvironmentService,
    ) {}

    async init(): Promise<void> {
        this.subCommands.push(
            {
                command: 'add',
                runCommand: async (interaction) => {
                    const user = interaction.options.getUser('user');
                    if (!user) return;
                    console.log('quote add ' + user.username);

                    if (interaction.user.id === user.id && user.id !== this.env.getGodId()) {
                        await interaction.reply({ content: "You can't quote yourself, cheeky", ephemeral: true });
                        return;
                    }

                    if (user.bot) {
                        await interaction.reply({ content: "You can't quote bots", ephemeral: true });
                    }

                    if (!interaction.channel) return;

                    const channelMessages = await interaction.channel.messages.fetch({ limit: 100 });

                    if (!channelMessages) return;

                    const messages = channelMessages.filter((m) => m.author.id === user.id);

                    if (!messages) return;

                    const message = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).first();

                    if (message !== undefined) {
                        await this.quoteService.addQuote(message, interaction.user.id);
                        await interaction.reply({ content: message?.content, ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'No recent message found', ephemeral: true });
                    }
                    return;
                },
            },
            {
                command: 'rand',
                runCommand: async (interaction) => {
                    const user = interaction.options.getUser('user');
                    if (!user) return;

                    const message = await this.quoteService.getRandomQuote(
                        user.id,
                        interaction.channelId,
                        interaction.guildId as string,
                    );
                    await this.sendQuote(interaction, message);
                },
            },
            {
                command: 'last',
                runCommand: async (interaction) => {
                    const user = interaction.options.getUser('user');
                    if (!user) return;

                    const message = await this.quoteService.getLastQuote(
                        user.id,
                        interaction.channelId,
                        interaction.guildId as string,
                    );
                    await this.sendQuote(interaction, message);
                },
            },
        );
    }

    async runCommand(interaction: ChatInputCommandInteraction) {
        return;
    }

    async sendQuote(interaction: ChatInputCommandInteraction, message?: QuoteDocument) {
        if (message !== undefined) {
            const quotedUser = await this.discordService.getUserById(message.userId);
            if (quotedUser !== undefined)
                await interaction.reply(italic('"' + message.content + '"') + ' - ' + userMention(quotedUser.id));
            else await interaction.reply('"' + message.content + '"');
        } else {
            await interaction.reply({ content: 'No quotes found', ephemeral: true });
        }
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Save and recall messages')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('add')
                    .setDescription('Save a message sent by a user')
                    .addUserOption((option) =>
                        option.setName('user').setDescription('The user to quote').setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('last')
                    .setDescription('Retrieve the last quote from a user')
                    .addUserOption((option) =>
                        option.setName('user').setDescription('The user to fetch').setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('rand')
                    .setDescription('Retrieve a random quote from a user')
                    .addUserOption((option) =>
                        option.setName('user').setDescription('The user to fetch').setRequired(true),
                    ),
            );
    }
}
