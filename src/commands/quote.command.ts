import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import DiscordService from '../services/discord.service';
import MessageHistoryService from '../services/message-history.service';
import QuoteService from '../services/quote.service';
import EnvironmentService from '../services/environment.service';
import { ChatInputCommandInteraction, Formatters } from 'discord.js';
import { QuoteDocument } from '../schemas/quote.schema';

@Service()
export default class QuoteCommand implements CommandInterface {
    command = 'quote';

    constructor(private discordService: DiscordService,
                private messageHistoryService: MessageHistoryService,
                private quoteService: QuoteService,
                private env: EnvironmentService) {
    }

    init(): void {
        this.discordService.onChatCommand(this.command).subscribe(async (interaction) => {
            const user = interaction.options.getUser('user');
            if (user && interaction.options.getSubcommand() === 'add') {
                console.log('quote add ' + user.username);

                if (interaction.user.id === user.id && user.id !== this.env.getGodId()) {
                    await interaction.reply({content: 'You can\'t quote yourself, cheeky', ephemeral: true});
                    return;
                }

                if (user.bot) {
                    await interaction.reply({content: 'You can\'t quote bots', ephemeral: true});
                }

                if (!interaction.channel)
                    return;

                const channelMessages = await interaction.channel.messages.fetch({limit: 100})

                if (!channelMessages)
                    return;

                const messages = channelMessages.filter(m => m.author.id === user.id);

                if (!messages)
                    return;

                const message = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).first();

                if (message !== undefined) {
                    await this.quoteService.addQuote(message, interaction.user.id);
                    await interaction.reply({content: message?.content, ephemeral: true});
                } else {
                    await interaction.reply({content: 'No recent message found', ephemeral: true});
                }
                return;
            }

            if (user && interaction.options.getSubcommand() === 'last') {
                console.log('quote last ' + user.username);
                if (!interaction.guildId)
                    return;

                const message = await this.quoteService.getLastQuote(user.id, interaction.channelId, interaction.guildId);
                await this.sendQuote(interaction, message);
            }

            if (user && interaction.options.getSubcommand() === 'rand') {
                console.log('quote rand' + user.username);
                if (!interaction.guildId)
                    return;

                const message = await this.quoteService.getRandomQuote(user.id, interaction.channelId, interaction.guildId);
                await this.sendQuote(interaction, message);
            }
        })
    }

    async sendQuote(interaction: ChatInputCommandInteraction, message?: QuoteDocument) {
        if (message !== undefined) {
            const quotedUser = await this.discordService.getUserById(message.userId);
            if (quotedUser !== undefined)
                await interaction.reply('"' + message.content + '"' + ' - ' + Formatters.userMention(quotedUser.id));
            else
                await interaction.reply('"' + message.content + '"');
        } else {
            await interaction.reply({content: 'No quoted found', ephemeral: true})
        }
    }
}